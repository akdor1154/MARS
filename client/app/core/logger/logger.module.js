(function() {
  'use strict';

  angular
    .module('app.logger', [])
    .config(config);
    
  
  config.$inject = ['$provide', '$logProvider'];
    
  function config($provide, $logProvider) {
    $provide.decorator('$log', extendLog);
    
    extendLog.$inject = ['$delegate', 'logger'];
  
    function extendLog($delegate, logger) {
      var self = this;
      
      return {
        debug: debug,
        info: logger.info,
        warn: logger.warn,
        error: logger.error,
        getInstance: getInstance
      };
      
      function debug() {
        if ($logProvider.debugEnabled()) {
          logger.debug.apply(self, arguments);
        } 
      }
      
      function getInstance(instanceName) {
        var inst = logger.getInstance(instanceName);
        inst.debug = debug;
        return inst;
      }
      
    }
  }
  
})();