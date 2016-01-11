(function() {
  'use strict';
  
  angular
    .module('app.myPolls')
    .controller('TrashController', TrashController);
      
  TrashController.$inject = [
    '$log', 
    '$anchorScroll',
    '$scope',
    '$state',
    'shell',  
    'myPollsService'
  ];
    
  function TrashController(
      $log, 
      $anchorScroll,
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
    
    function restoreAllGroupsInCollection(collection) {
      //  TODO: trash.restoreAllGroupsInCollection()
    }
    
    function restoreGroup(group) {
      group._action = 'Restoring';
      myPollsService.restoreGroup(group).then(function() {
        delete group._isRestoring;
        vm.groups.splice(vm.groups.indexOf(group), 1);
        var filteredIndex = vm.filteredGroups.indexOf(group);
        if (filteredIndex >= 0)
          vm.filteredGroups.splice(filteredIndex, 1);
      });
    }
    
    function restorePoll(group, poll) {
      poll._action = 'Restoring';
      myPollsService.restorePoll(poll).then(function() {
        poll._action = null;
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
    
    function _searchCallback(phrase) {
      vm.filteredGroups = myPollsService.searchGroups(vm.groups, phrase);
    }
    
  }
  
})();