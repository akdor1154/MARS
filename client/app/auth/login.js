(function() {
  'use strict';
  
  angular
    .module('app.auth')
    .controller('LoginController', LoginController);
      
  LoginController.$inject = [
    '$log', 
    '$mdDialog', 
    'auth'
  ];
    
  function LoginController($log, $mdDialog, auth) {
    $log = $log.getInstance('LoginController');
    
    /* jshint validthis: true */
    var vm = this;
    
    vm.user = { username: '', password: '' };
    
    vm.login = login;
    vm.serverErrors = null;
    
    function login() {
      vm.isLoggingIn = true;
      auth.login(vm.user).then(function() {
        $mdDialog.hide();
      })
      .catch(function(err) {
        $log.error('Login failed: ', err);
        vm.serverErrors = {};
        vm.serverErrors[err.code] = true;
        vm.isLoggingIn = false;
      });
    }
  }
  
})();