(function() {
'use strict';
  
  angular
    .module('app.poll')
    .controller('MyFeedsController', MyFeedsController);
      
  MyFeedsController.$inject = ['$log', '$mdDialog', 'pollService'];
    
  function MyFeedsController($log, $mdDialog, pollService) {
    $log = $log.getInstance('MyFeedsController');
    
    /* jshint validthis: true */
    var vm = this;
    
    vm.action = 'Loading';
    vm.cancel = cancel;
    vm.close = close;
    vm.subscriptions = [];
    vm.unsubscribe = unsubscribe;
    
    activate();
    
    function activate() {
      pollService.getSubscriptions()
        .then(function(subscriptions) {
          angular.copy(subscriptions, vm.subscriptions);
          vm.action = null;
        });
    }
    
    function cancel() {
      $mdDialog.cancel();
    }

    function close() {
      $mdDialog.hide();
    }
    
    function unsubscribe(subscription) {
      var index = vm.subscriptions.indexOf(subscription);
      if (index < 0)
        return;
      vm.subscriptions.splice(index, 1);
      pollService.unsubscribe(subscription);
    }
    
  }
  
})();