(function() {
  'use strict';

  angular
    .module('app.logger', [])
    .config(config);
    
  
  config.$inject = ['$provide'];
    
  function config($provide) {
    $provide.decorator('$log', extendLog);
  }
  
  
  extendLog.$inject = ['$delegate', 'logger'];
  
  function extendLog($delegate, logger) {
    return {
      debug: logger.debug,
      info: logger.info,
      warn: logger.warn,
      error: logger.error,
      getInstance: logger.getInstance
    };
  }
  
})();