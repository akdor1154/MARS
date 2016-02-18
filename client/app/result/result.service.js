(function() {
  'use strict';
  
  angular
    .module('app.result')
    .factory('resultService', resultService);
      
  resultService.$inject = ['$log', '$rootScope', '$q', 'marsService'];
    
  function resultService($log, $rootScope, $q, marsService) {
    $log = $log.getInstance('resultService');
    
    marsService.on('poll activate', _onResultActivate);
    marsService.on('result resume', _onResultActivate);
    marsService.on('result deactivate', _onResultDeactivate);
    
    return {
      deactivate: deactivate,
      getActivations: getActivations,
      onResultActivate: onResultActivate,
      onResultDeactivate: onResultDeactivate,
      resume: resume,
      subscribe: subscribe
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
    
/**
 * Subscribe to receive responses for a result.
 *
 */
    function subscribe(resultId) {
      return marsService.request('result viewer', { _id: resultId });
    }
    
    
    function _onResultActivate(event, result) {
      $rootScope.$broadcast('resultActivate', result);
    }
    
    function _onResultDeactivate(event, result) {
      $rootScope.$broadcast('resultDeactivate', result);
    }
    
  }
  
})();
	
