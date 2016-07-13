(function() {
  'use strict';
  
  angular
    .module('app.myPolls')
    .controller('CloneCollectionController', CloneCollectionController);
      
  CloneCollectionController.$inject = [
    '$log',
    '$state',
    '$mdDialog',
    'myPollsService',
    'collection'
  ];
    
  function CloneCollectionController(
      $log, 
      $state, 
      $mdDialog,
      myPollsService,
      collection
    ) {
    $log = $log.getInstance('CloneCollectionController');
    
    /* jshint validthis: true */
    var vm = this;
    
    vm.action = null;
    vm.archive = true;
    vm.cancel = cancel;
    vm.clone = clone;
    vm.collection = collection;
    vm.newCollection = {};
    
    activate();
    
    function activate() {
      vm.newCollection.name = _defaultClonedName(collection);
    }
    
    function cancel() {
      $mdDialog.cancel();
    }

    function clone() {
      vm.action = 'Cloning';
      myPollsService.cloneCollection(
        vm.collection, 
        vm.archive, 
        vm.newCollection
      ).then(function(newCollection) {
        $mdDialog.hide()
        .then(function(){
          // The change created by myPollsService in the collection
          // model is not being recognised in the side nav.
          // Work around: Update vm.collection.archived here as well.
          if (vm.archive)
            vm.collection.archived = new Date();
          $state.go('myPolls.collections.viewCollection',
          { collectionId: newCollection._id });        
        })
      })
      .catch(function(err) {
        vm.action = null;
      });
    }

    function _defaultClonedName(collection) {
      var numericPatternRegex = /(\s)(\d+)$/;
      if (numericPatternRegex.test(collection.name)) {
        return collection.name.replace(numericPatternRegex, function(match, space, n) {
          n = parseInt(n) + 1;
          return _.isFinite(n) ? space + n.toString() : space + '1';
        });
      }
      return collection.name + ' 1';
    }
    
  }
  
})();
