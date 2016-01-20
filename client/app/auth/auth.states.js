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
      .state('auth.entry', {
        url: '/',
        onEnter: [
          '$state',
          'auth',
          function($state, auth) {
            auth.isAuthenticated().
              then(function(user) {
                $state.go(user.group === 'poller' ? 'myPolls' : 'poll');
              })
              .catch(function() {
                $state.go('auth.login');
              });
          }
        ]
      })
      .state('auth.login', {
        onEnter: [
            '$window',
            function($window) {
              $window.location.assign('./login');
            }
          ]
      })
      .state('auth.loginForm', {
        url: '/login',
        onEnter: [
          '$mdDialog',
          '$state',
          function($mdDialog, $state) {
            $mdDialog.show({
              templateUrl: 'app/auth/login.html',
              controller: 'LoginController as vm'
            }).finally(function() {
              $state.go('auth.entry');
            });
          }
        ]
      })
      .state('auth.logout', {
        onEnter: [
            '$window',
            function($window) {
              $window.location.assign('./logout');
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