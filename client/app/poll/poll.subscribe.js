(function() {
  'use strict';
  
  angular
    .module('app.poll')
    .controller('PollSubscribeController', PollSubscribeController);
      
  PollSubscribeController.$inject = [
    '$log', 
    '$mdDialog', 
    'pollService'];
    
  function PollSubscribeController($log, $mdDialog, pollService) {
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
        })
        .catch(function(err) {
          if(err.code)
            vm.serverErrors[err.code] = true;
          vm.action = null;
        });
    }
    
  }
  
})();