(function() {
  'use strict';
  
  angular
    .module('app.myPolls')
    .controller('ArchiveController', ArchiveController);
      
  ArchiveController.$inject = [
    '$log', 
    '$anchorScroll',
    '$mdDialog',
    '$scope',
    '$state',
    'shell',  
    'myPollsService'
  ];
    
  function ArchiveController(
      $log, 
      $anchorScroll,
      $mdDialog,
      $scope, 
      $state, 
      shell, 
      myPollsService
    ) {
    $log = $log.getInstance('ArchiveController');
    
    /* jshint validthis: true */
    var vm = this;
    
    vm.collections = null;
    vm.deleteGroup = deleteGroup;
    vm.deleteCollection = deleteCollection;
    vm.exportResults = exportResults;
    vm.collectionExportResults = collectionExportResults;
    vm.viewResult = viewResult;
    vm.unarchive = unarchive;
    vm.shell = shell;
    
    activate();
    
    function activate() {
      shell.setTitle($scope, 'Archive');
      myPollsService.getCollections()
      .then(function(collections) {
        vm.collections = _.filter(collections, function(collection) {
          return _.isDate(collection.archived);
        });
      });
      $anchorScroll('top');
    }
    
    function collectionExportResults(collection) {
      exportResults(collection.groups);
    }
    
    function deleteCollection(collection) {
      $mdDialog.show(
        $mdDialog.confirm()
          .title('Delete Collection')
          .content('Are you sure you would like to delete the collection ' + collection.name + '?')
          .ok('Yes')
          .cancel('Cancel')
      ).then(function() {
        vm.collections.splice(vm.collections.indexOf(collection), 1);
        myPollsService.deleteCollection(collection, collection.groups.length === 0);
      });
    }
    
    function deleteGroup(collectionIndex, group) {
      $mdDialog.show(
        $mdDialog.confirm()
          .title('Delete Group')
          .content('Are you sure you would like to delete the group ' + group.collection.name + ' - ' + group.name + '?')
          .ok('Yes')
          .cancel('Cancel')
        ).then(function() {
          console.log(vm.collections)
          var groups = vm.collections[collectionIndex].groups;
          vm.collections[collectionIndex].groups.splice(groups.indexOf(group), 1);
          myPollsService.deleteGroup(group);
        });
    }
    
    function exportResults(groups) {
      if (!angular.isArray(groups))
        groups = [groups];
      $state.go('myPolls.archive.exportResults', {
        groups: groups
      });
    }
    
    function unarchive(collection) {
      myPollsService.unarchiveCollection(collection)
      .then(function(){
        vm.collections.splice(vm.collections.indexOf(collection), 1);
      })
    }
    
    function viewResult(poll) {
      $log.debug('viewResult: ', poll._id);
      var resultCallback = function(result) {
        $state.go('result', { resultId: result._id, mode: 'archive' });
      };
      return myPollsService.getLastResult(poll)
        .then(resultCallback)
        .catch(function(err) {
          if (err.code && err.code === 404)
            return myPollsService.createResult(poll).then(resultCallback);
        });
    }
  }
  
})();