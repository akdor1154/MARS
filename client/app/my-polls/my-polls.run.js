(function() {
  'use strict';
  
  angular
    .module('app.myPolls')
    .run(run);
    
  run.$inject = ['$log', '$rootScope', '$state'];
  
  function run($log, $rootScope, $state) {
    
    $rootScope.$on('$stateChangeStart', 
      function(event, toState, toParams, fromState, fromParams) {
        // The state 'myPolls' provides the shell, but it should not be the final
        // destination. Redirect 'myPolls' to 'myPolls.upcoming'.
        if (toState.name === 'myPolls') {
          event.preventDefault();
          $state.go('myPolls.upcoming');
        }
        // Redirect 'myPolls.help' to 'myPolls.help.default'.
        if (toState.name === 'help') {
          event.preventDefault();
          $state.go('myPolls.help.default');
        }
      }
    );
    
  }
  
})();