(function() {
  'use strict';
  
  angular
    .module('app.logger')
    .service('logger', logger);
    
  
  logger.$inject = ['$window'];
  
  function logger($window) {
    
    return {
      debug: _log('debug'),
      info: _log('info'),
      warn: _log('warn'),
      error: _log('error'),
      getInstance: getInstance
    };
    
	
    function getInstance(instanceName) {
      return {
        debug: _log('debug', instanceName),
        info: _log('info', instanceName),
        warn: _log('warn', instanceName),
        error: _log('error', instanceName)
      }
    }
	
	/** Util methods **/
	
    function _log(type, instanceName) {
      var console = $window.console || {},
          logFn = console[type] || console._log || noop;
      
      return function() {
        var args = [];
        angular.forEach(arguments, function(arg, index) {
          args.push(_formatArg(arg, instanceName, index === 0));
        });
        return logFn.apply(console, args);
      };
    }
	
    function _formatArg(arg, instanceName, first) {
      if (arg instanceof Error)
        return _formatError(arg);
      if (!angular.isString(arg))
        return arg;
          var prefix = first 
              ? instanceName
                  ? '[' + _timestamp() + ']  ' + instanceName + '  '
                  : '[' + _timestamp() + ']  '
              : '';
      return prefix + arg;
    }
	
    function _formatError(arg, instanceName) {		
      if (arg.stack) {
        arg = (arg.message && arg.stack.indexOf(arg.message) === -1)
          ? 'Error: ' + arg.message + '\n' + arg.stack
          : arg.stack;
      } 
      else if (arg.sourceURL) {
        arg = arg.message + '\n' + arg.sourceURL + ':' + arg.line;
      }
      return arg;
    }

    function _log(type, instanceName) {
      var console = $window.console || {},
          logFn = console[type] || console._log || noop;
      
      return function() {
        var args = [];
        angular.forEach(arguments, function(arg, index) {
          args.push(_formatArg(arg, instanceName, index === 0));
        });
        return logFn.apply(console, args);
      };
    }
    
    function _pad(str, length) {
      return ('000' + str).slice(-length)
    }
  
    function _timestamp() {
      var now = new Date();
      return _pad(now.getHours(), 2) + ':' + _pad(now.getMinutes(), 2) + ':' + _pad(now.getSeconds(), 2) + '.' + _pad(now.getMilliseconds(), 3);
    }
    
  }
  
})();