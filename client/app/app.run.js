(function() {
  'use strict';
  
  angular
    .module('app')
    .run(appRun);
    
  appRun.$inject = ['$log', '$rootScope', '$state'];
  
  function appRun($log, $rootScope, $state) {
    
    $log.info('MARS $$VERSION$$');
    
    $rootScope.goToPreviousState = goToPreviousState;
    
    function goToPreviousState(defaultState, defaultParams) {
      if (!$rootScope.previousState || !$rootScope.previousState.name)
        $state.go(defaultState, defaultParams);
      $state.go($rootScope.previousState, $rootScope.previousStateParams);
    }
    
    // Make the previous state available on $rootScope so that views and 
    // dialogs can go back.
    $rootScope.$on('$stateChangeSuccess', 
      function(event, toState, toParams, fromState, fromParams) {
        $rootScope.previousState = fromState;
        $rootScope.previousStateParams = fromParams;
        $log.debug(fromState.name + ' -> ' + toState.name, toParams);
      }
    );
  }
  
})();