(function() {
  'use strict';
  
  angular
    .module('app.myPolls')
    .controller('AddCollectionController', AddCollectionController);
      
  AddCollectionController.$inject = ['$log', '$mdDialog', 'myPollsService'];
    
  function AddCollectionController($log, $mdDialog, myPollsService) {
    $log = $log.getInstance('AddCollectionController');
    
    /* jshint validthis: true */
    var vm = this;
    
    vm.action = null;
    vm.cancel = cancel;
    vm.create = create;
    vm.collection = {
      name: '',
      groups: [],
      owners: []
    };
    
    function create() {
      vm.action = 'Saving';
      myPollsService.createCollection(vm.collection)
        .then(function(savedCollection) {
          vm.action = null;
          $mdDialog.hide(savedCollection);
        });
    }
    
    function cancel() {
      $mdDialog.cancel();
    }
    
  }
  
})();