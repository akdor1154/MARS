(function() {
'use strict';
  
  angular
    .module('app.poll')
    .controller('MyDisplayNameController', MyDisplayNameController);
      
  MyDisplayNameController.$inject = [
    '$log',
    '$mdDialog',
    'auth',
    'pollService'
  ];
    
  function MyDisplayNameController($log, $mdDialog, auth, pollService) {
    $log = $log.getInstance('MyDisplayNameController');
    
    /* jshint validthis: true */
    var vm = this;
    
    vm.cancel = cancel;
    vm.save = save;
    vm.user = auth.user();
    
    function cancel() {
      $mdDialog.cancel();
    }
    
    function save() {
      pollService.updateUser(vm.user)
        .then(function() {
          $mdDialog.hide();
        });
    }
  }
  
})();