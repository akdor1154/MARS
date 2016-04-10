(function() {
  'use strict';
  
  angular
    .module('app.result')
    .factory('resultService', resultService);
      
  resultService.$inject = ['$log', '$rootScope', '$q', 'marsService'];
    
  function resultService($log, $rootScope, $q, marsService) {
    $log = $log.getInstance('resultService');
    
    var results = {};
    
    marsService.on('poll activate', _onResultActivate);
    marsService.on('result resume', _onResultActivate);
    marsService.on('result deactivate', _onResultDeactivate);
    marsService.on('response', _onResponseReceived);
    
    return {
      createResult: createResult,
      deactivate: deactivate,
      getActivations: getActivations,
      onResultActivate: onResultActivate,
      onResultDeactivate: onResultDeactivate,
      resume: resume,
      subscribe: subscribe,
      update: update
    }
    
    function createResult(pollId) {
      return marsService.request('result create', { _id: pollId });
    }
    
    function deactivate(resultId) {
      return marsService.request('result deactivate', { _id: resultId });
    }
    
    function getActivations(pollId) {
      return marsService.request('poll list activations', { _id: pollId });
    }
    
    function onResultActivate(scope, callback) {
      var handler = $rootScope.$on('resultActivate', callback);
      scope.$on('$destroy', handler);
    }
    
    function onResultDeactivate(scope, callback) {
      var handler = $rootScope.$on('resultDeactivate', callback);
      scope.$on('$destroy', handler);
    }

    function resume(resultId, fromId) {
      var data = { _id: resultId };
      if (fromId)
        data.from = fromId;
      return marsService.request('result resume', data);
    }
    
    function update(result, keys) {
      var resultCopy = marsService.clone(result, keys);
      marsService.depopulate(resultCopy, ['poll', 'pollCollection']);
      return marsService.request('result update', resultCopy);
    }
    
/**
 * Subscribe to receive responses for a result.
 *
 */
    function subscribe(resultId) {
      return marsService.request('result viewer', { _id: resultId })
        .then(function(result) {
          results[result._id] = result;
          return result;
        });
    }
    
    function _onResponseReceived(event, data) {
      if (results[data._id])
        results[data._id].responses.push(_.omit(data, '_id'));
    }
    
    function _onResultActivate(event, result) {
      $rootScope.$broadcast('resultActivate', result);
    }
    
    function _onResultDeactivate(event, result) {
      $rootScope.$broadcast('resultDeactivate', result);
    }
    
  }
  
})();
	
