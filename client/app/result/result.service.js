(function() {
  'use strict';
  
  angular
    .module('app.result')
    .factory('resultService', resultService);
      
  resultService.$inject = ['$log', '$rootScope', '$q', 'marsService'];
    
  function resultService($log, $rootScope, $q, marsService) {
    $log = $log.getInstance('resultService');
    
    return {
      deactivate: deactivate,
      getActivations: getActivations,
      resume: resume,
      subscribe
    }
    
    function deactivate(resultId) {
      return marsService.request('result deactivate', { _id: resultId });
    }
    
    function getActivations(pollId) {
      return marsService.request('poll list activations', { _id: pollId });
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
    
  }
  
})();
	
