(function() {
  'use strict';
  
  angular
    .module('app.myPolls')
    .controller('CloneCollectionController', CloneCollectionController);
      
  CloneCollectionController.$inject = [
    '$log',
    '$mdDialog',
    'myPollsService',
    'collection'
  ];
    
  function CloneCollectionController(
      $log, 
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
        collection, 
        vm.archive, 
        vm.newCollection
      ).then(function(newCollection) {
        $mdDialog.hide(newCollection);
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
