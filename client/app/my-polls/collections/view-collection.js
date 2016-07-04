(function() {
  'use strict';
  
  angular
    .module('app.myPolls')
    .controller('ViewCollectionController', ViewCollectionController);
      
  ViewCollectionController.$inject = [
    '$log', 
    '$anchorScroll',
    '$mdDialog',
    '$scope',
    '$state',
    '$stateParams',
    'shell', 
    'myPollsService'
  ];
    
  function ViewCollectionController(
      $log, 
      $anchorScroll,
      $mdDialog,
      $scope, 
      $state, 
      $stateParams, 
      shell, 
      myPollsService
    ) {
    $log = $log.getInstance('ViewCollectionController');
    
    /* jshint validthis: true */
    var vm = this;
    
    vm.addGroup = addGroup;
    vm.collection = null;
    vm.deleteGroup = deleteGroup;
    vm.editGroup = editGroup;
    vm.editPolls = editPolls;
    vm.exportResults = exportResults;
    vm.filteredGroups = null;
    vm.groups = null;
    vm.isUpcoming = isUpcoming;
    vm.reorderGroup = reorderGroup;
    vm.saveTimeout = null;
    vm.shell = shell;
    vm.toggleUpcoming = toggleUpcoming;
    vm.viewResult = viewResult;
    
    activate();
    
    function activate() {
      // When returning to this state from child states, it's necessary
      // to set the collection again so that changes are reflected in vm.
      $scope.$on('$stateChangeSuccess',
        function(event, toState, toParams, fromState, fromParams) {
          if (toState.name === 'myPolls.collections.viewCollection' 
              && vm.collection)
            _setCollection(vm.collection);
        }
      );
    
      myPollsService.getCollection($stateParams.collectionId)
        .then(_setCollection);
        
      $anchorScroll('top');
    }
    
    
    function addGroup() {
      $state.go('myPolls.collections.viewCollection.addGroup', {
        collection: vm.collection
      });
    }
    
    function cloneCollection() {
      $state.go('myPolls.collections.viewCollection.cloneCollection', {
        collection: vm.collection
      });
    }

    function collectionExportResults() {
      exportResults(vm.collection.groups);
    }
    
    function deleteCollection() {
      var collection = vm.collection;
      $mdDialog.show(
        $mdDialog.confirm()
          .title('Delete Collection')
          .content('Are you sure you would like to delete the collection ' + collection.name + '?')
          .ok('Yes')
          .cancel('Cancel')
      ).then(function() {
        myPollsService.deleteCollection(collection, collection.groups.length === 0);
        $state.go('myPolls.upcoming');
      });
    }
    
    function deleteGroup(group) {
      $mdDialog.show(
        $mdDialog.confirm()
          .title('Delete Group')
          .content('Are you sure you would like to delete the group ' + group.collection.name + ' - ' + group.name + '?')
          .ok('Yes')
          .cancel('Cancel')
        ).then(function() {
          vm.groups.splice(vm.groups.indexOf(group), 1);
          var filteredIndex = vm.filteredGroups.indexOf(group);
          if (filteredIndex >= 0)
            vm.filteredGroups.splice(filteredIndex, 1);
          myPollsService.deleteGroup(group);
        });
    }
    
    function editCollection() {
      $state.go('myPolls.collections.viewCollection.editCollection', {
        collection: vm.collection
      });
    }
    
    function editGroup(group) {
      $state.go('myPolls.collections.viewCollection.editGroup', { 
        group: group
      });
    }
    
    function editPolls(group, jumpToAddPoll) {
      var stateName = jumpToAddPoll
        ? 'myPolls.collections.editPolls.addPoll'
        : 'myPolls.collections.editPolls';
      $state.go(stateName, { 
        collectionId: group.collection._id,
        groupId: group._id,
        group: group
      });
    }
    
    function exportResults(groups) {
      if (!angular.isArray(groups))
        groups = [groups];
      $state.go('myPolls.collections.viewCollection.exportResults', {
        groups: groups
      });
    }
    
    function isUpcoming(group) {
      return group.upcoming !== null && group.upcoming <= new Date();
    }
    
    function leaderboard() {
      $state.go('myPolls.collections.leaderboard', { 
        collectionId: vm.collection._id 
      });
    }
    
    function reorderGroup(fromIndex, toIndex) {
      if (toIndex < 0 || toIndex >= vm.groups.length)
        return;
      var group1 = vm.groups[fromIndex],
          group2 = vm.groups[toIndex];
      myPollsService.swapGroups(group1, group2);
      vm.groups[fromIndex] = group2;
      vm.groups[toIndex] = group1;
      $anchorScroll('group-' + toIndex);
    }
    
    function saveTimeoutCallback() {
      myPollsService.updateCollection(vm.collection, 'groups');
    }
    
    function toggleUpcoming(group) {
      group.upcoming = isUpcoming(group) ? null : new Date();
      myPollsService.updateGroup(group, 'upcoming');
    }
    
    function viewResult(poll) {
      $log.debug('viewResult: ', poll._id);
      var resultCallback = function(result) {
        $state.go('result', { resultId: result._id });
      };
      return myPollsService.getLastResult(poll)
        .then(resultCallback)
        .catch(function(err) {
          if (err.code && err.code === 404)
            return myPollsService.createResult(poll).then(resultCallback);
        });
    }
    
    
    function _searchCallback(phrase) {
      vm.filteredGroups = myPollsService.searchGroups(vm.groups, phrase);
    }
    
    function _setCollection(collection) {
      shell.setTitle($scope, collection.name);
      shell.setSearch($scope, _searchCallback);
      shell.setMenu($scope, [
        { 
          label: 'Leaderboard', 
          callback: leaderboard, 
          icon: 'format_list_numbered'
        },
        { 
          label: 'Export Results', 
          callback: collectionExportResults, 
          icon: 'file_download'
        },
        { 
          label: 'Edit Collection', 
          callback: editCollection, 
          icon: 'edit' 
        },
        { 
          label: 'Clone Collection', 
          callback: cloneCollection, 
          icon: 'control_point_duplicate'
        },
        { 
          label: 'Delete Collection', 
          callback: deleteCollection, 
          icon: 'delete' 
        }
      ]);
      vm.collection = collection;
      vm.groups = _.filter(collection.groups, function(group) {
        return !angular.isDate(group.deleted);
      });
      _searchCallback(); // Populate vm.filteredGroups
    }
    
  }
  
})();