(function() {
  'use strict';
  
  angular
    .module('app.myPolls')
    .controller('EditCollectionController', EditCollectionController);
      
  EditCollectionController.$inject = [
    '$log', 
    '$mdDialog', 
    'auth',
    'myPollsService',
    'collection'
  ];
    
  function EditCollectionController(
      $log, 
      $mdDialog, 
      auth,
      myPollsService,
      collection) {
    $log = $log.getInstance('EditCollectionController');
    
    /* jshint validthis: true */
    var vm = this;
    
    vm.action = null;
    vm.addOwner = addOwner;
    vm.addOwnerSelectedUser = null;
    vm.addOwnerText = null;
    vm.cancel = cancel;
    vm.collection = {
      _id: collection._id,
      name: collection.name,
      owners: _.sortBy(collection.owners, function(o) { 
        return o.name.first + o.name.last; 
      })
    };
    vm.removeOwner = removeOwner;
    vm.save = save;
    vm.searchUsers = searchUsers;
    vm.serverErrors = {};
    vm.user = auth.user();
    
    function addOwner(user) {
      if (!user)
        return;
      var i = _.sortedIndex(vm.collection.owners, user, function(o) {
        return o.name.first + o.name.last;
      });
      vm.collection.owners.splice(i, 0, user);
      vm.addOwnerSelectedUser = null;
      vm.addOwnerText = null;
    }
    
    function removeOwner(owner) {
      vm.collection.owners.splice(
        vm.collection.owners.indexOf(owner),
        1
      );
    }
    
    function searchUsers(phrase) {
      return myPollsService.searchUsers(phrase, 'poller')
        .then(function(users) {
          var ownerIds = _.pluck(vm.collection.owners, '_id');
          return _.filter(users, function(user) {
            return !_.contains(ownerIds, user._id);
          });
        });
    }
    
    function save() {
      vm.action = 'Saving';
      myPollsService.updateCollection(vm.collection)
        .then(function() {
          collection.name = vm.collection.name;
          collection.owners = vm.collection.owners;
          myPollsService.cascadeOwners(collection);
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