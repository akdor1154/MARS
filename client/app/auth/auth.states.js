(function() {
  'use strict';
  
  angular
    .module('app.auth')
    .config(statesConfig);
      
  statesConfig.$inject = ['$stateProvider'];
  
  function statesConfig($stateProvider) {
    $stateProvider
      .state('auth', {
        template: '<ui-view />'
      })
      .state('auth.login', {
        onEnter: [
            '$state',
            '$mdDialog',
            function($state, $mdDialog, $log) {
              $mdDialog.show({
                templateUrl: 'app/auth/login.html',
                controller: 'LoginController as vm'
              }).finally(function() {
                $state.go('poll');
              });
            }
          ]
      })
      .state('auth.forbidden', {
        onEnter: [
            '$rootScope',
            '$mdDialog',
            function($rootScope, $mdDialog) {
              $mdDialog.show(
                $mdDialog.alert()
                  .title('Not Authorized')
                  .content('You do not have permission to access this.')
                  .ok('Ok')
              ).finally(function() {
                $rootScope.goToPreviousState();
              });
            }
          ]
      })
  }
  
})();