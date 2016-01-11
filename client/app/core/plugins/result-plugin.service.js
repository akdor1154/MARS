(function() {
  'use strict';
  
  angular
    .module('app.plugins')
    .factory('resultPluginService', resultPluginService);
      
  resultPluginService.$inject = ['$log', '$rootScope', 'marsService'];
    
  function resultPluginService($log, $rootScope, marsService) {
    $log = $log.getInstance('resultPluginService');
    
    marsService.on('response', _onResponseReceived);
    
    return {
      onResponseReceived: onResponseReceived,
    }
    
/**
 * Register a listener for poll responses
 *
 */
    function onResponseReceived(scope, resultId, callback) {
      var handler = scope.$on(
        'response received ' + resultId,
        function(event, response) { callback(response); }
      );
      scope.$on('$destroy', handler);
    }
    
    function _onResponseReceived(event, data) {
      $log.debug('response = ', data);
      $log.debug('$broadcast to: "' + 'response received ' + data._id + '"');
      $rootScope.$broadcast('response received ' + data._id, data);
    }
    
  }
  
})();