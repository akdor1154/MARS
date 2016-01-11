(function() {
  'use strict';
  
  angular
    .module('app.debounce')
    .factory('debounce', debounce);
      
  debounce.$inject = ['$log', '$timeout'];
    
  function debounce($log, $timeout) {
    $log = $log.getInstance('debounce');
        
    return function(fn, delay) {
      var args, context, timeout;
      
      function later() {
        fn.apply(context, args);
        context = args = null;
      }
      
      return function() {
        context = this;
        args = arguments;
        if (timeout)
          $timeout.cancel(timeout);
        timeout = $timeout(later, delay);
      }
    }
    
  }
  
})();