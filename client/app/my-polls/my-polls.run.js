(function() {
  'use strict';
  
  angular
    .module('app.myPolls')
    .run(run);
    
  run.$inject = ['$log', '$rootScope', '$state'];
  
  function run($log, $rootScope, $state) {
    
    // The state 'myPolls' provides the shell, but it should not be the final
    // destination. Redirect 'myPolls' to 'myPolls.upcoming'.
    $rootScope.$on('$stateChangeStart', 
      function(event, toState, toParams, fromState, fromParams) {
        if (toState.name === 'myPolls') {
          event.preventDefault();
          $state.go('myPolls.upcoming');
        }
      }
    );
    
  }
  
})();