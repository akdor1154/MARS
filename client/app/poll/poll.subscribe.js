(function() {
  'use strict';
  
  angular
    .module('app.poll')
    .controller('PollSubscribeController', PollSubscribeController);
      
  PollSubscribeController.$inject = [
    '$log', 
    '$mdDialog', 
    '$mdToast',
    'pollService'];
    
  function PollSubscribeController(
    $log,
    $mdDialog,
    $mdToast,
    pollService
  ) {
    
    $log = $log.getInstance('PollSubscribeController');
    
    /* jshint validthis: true */
    var vm = this;
    
    vm.action = null;
    vm.cancel = cancel;
    vm.collectionToken = '';
    vm.serverErrors = {};
    vm.subscribe = subscribe;
    
    function cancel() {
      $mdDialog.cancel();
    }
    
    function subscribe() {
      vm.action = 'Joining';
      pollService.subscribe(vm.collectionToken)
        .then(function() {
          vm.action = null;
          $mdDialog.hide();
          $mdToast.show(
            $mdToast.simple()
            .textContent('Subscribed!')
          );
        })
        .catch(function(err) {
          if(err.code)
            vm.serverErrors[err.code] = true;
          vm.action = null;
        });
    }
    
  }
  
})();