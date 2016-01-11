(function() {
  'use strict';
  
  angular
    .module('app.myPolls')
    .controller('EditCollectionController', EditCollectionController);
      
  EditCollectionController.$inject = [
    '$log', 
    '$mdDialog', 
    'myPollsService',
    'collection'
  ];
    
  function EditCollectionController(
      $log, 
      $mdDialog, 
      myPollsService,
      collection) {
    $log = $log.getInstance('EditCollectionController');
    
    /* jshint validthis: true */
    var vm = this;
    
    vm.action = null;
    vm.cancel = cancel;
    vm.collection = {
      _id: collection._id,
      name: collection.name
    };
    vm.save = save;
    vm.serverErrors = {};
    
    function save() {
      vm.action = 'Saving';
      myPollsService.updateCollection(vm.collection)
        .then(function() {
          collection.name = vm.collection.name;
          vm.action = null;
          $mdDialog.hide(collection);
        })
        .catch(function(err) {
          vm.serverErrors[err.code] = true;
          vm.action = null;
        });
    }
    
    function cancel() {
      $mdDialog.cancel();
    }
    
  }
  
})();