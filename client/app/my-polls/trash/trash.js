(function() {
  'use strict';
  
  angular
    .module('app.myPolls')
    .controller('TrashController', TrashController);
      
  TrashController.$inject = [
    '$log', 
    '$anchorScroll',
    '$mdDialog',
    '$scope',
    '$state',
    'shell',  
    'myPollsService'
  ];
    
  function TrashController(
      $log, 
      $anchorScroll,
      $mdDialog,
      $scope, 
      $state, 
      shell, 
      myPollsService
    ) {
    $log = $log.getInstance('TrashController');
    
    /* jshint validthis: true */
    var vm = this;
    
    vm.groups = null;
    vm.filteredGroups = null;
    vm.deleteGroupPermanently = deleteGroupPermanently;
    vm.restoreAllGroupsInCollection = restoreAllGroupsInCollection;
    vm.restoreGroup = restoreGroup;
    vm.restorePoll = restorePoll;
    vm.shell = shell;
    
    activate();
    
    function activate() {
      shell.setTitle($scope, 'Trash');
      myPollsService.getGroups().then(function(groups) {
          vm.groups = _.filter(groups, function(group) {
            return _.isDate(group.deleted) 
                || _hasDeletedPolls(group);
          });
          _searchCallback();
          shell.setSearch($scope, _searchCallback);
        });
      $anchorScroll('top');
    }
    
    function deleteGroupPermanently(group) {
      $mdDialog.show(
        $mdDialog.confirm()
          .title('Delete Group Permanently')
          .htmlContent('Are you sure you would like to delete the group ' + group.name + '? <br/><strong>This can not be undone.</strong>')
          .ok('Yes')
          .cancel('Cancel')
      ).then(function() {
        group._action = 'Deleting';
        return myPollsService.deleteGroup(group, true);
      })
      .then(function() {
        delete group._action;
        _removeGroup(group);
      });
    }
    
    function restoreAllGroupsInCollection(collection) {
      //  TODO: trash.restoreAllGroupsInCollection()
    }
    
    function restoreGroup(group) {
      $log.debug('Restore group: ' + group.name);
      group._action = 'Restoring';
      myPollsService.restoreGroup(group).then(function() {
        delete group._action;
        _removeGroup(group);
      });
    }
    
    function restorePoll(group, poll) {
      poll._action = 'Restoring';
      myPollsService.restorePoll(poll).then(function() {
        delete poll._action;
        if (group.deleted || _hasDeletedPolls(group))
          return;
        vm.groups.splice(vm.groups.indexOf(group), 1);
        var filteredIndex = vm.filteredGroups.indexOf(group);
        if (filteredIndex >= 0)
          vm.filteredGroups.splice(filteredIndex, 1);
      });
    }
    
    
    function _hasDeletedPolls(group) {
      return _.some(group.polls, function(poll) {
        return _.isDate(poll.deleted);
      });
    }
    
    function _removeGroup(group) {
      vm.groups.splice(vm.groups.indexOf(group), 1);
      var filteredIndex = vm.filteredGroups.indexOf(group);
      if (filteredIndex >= 0)
        vm.filteredGroups.splice(filteredIndex, 1);
    }
    
    function _searchCallback(phrase) {
      vm.filteredGroups = myPollsService.searchGroups(vm.groups, phrase);
    }
    
  }
  
})();