(function() {
  'use strict';
  
  angular
    .module('app.myPolls')
    .controller('EditPollsController', EditGroupController);
      
  EditGroupController.$inject = [
    '$log', 
    '$anchorScroll',
    '$mdDialog',
    '$scope', 
    '$state', 
    '$stateParams', 
    'inflector',
    'shell', 
    'myPollsService'
  ];
    
  function EditGroupController(
      $log, 
      $anchorScroll,
      $mdDialog,
      $scope, 
      $state, 
      $stateParams, 
      inflector,
      shell, 
      myPollsService
    ) {
    $log = $log.getInstance('EditPollsController');
    
    /* jshint validthis: true */
    var vm = this;
    
    vm.activating = false;
    vm.addPoll = addPoll;
    vm.deletePoll = deletePoll;
    vm.group = null;
    vm.inflector = inflector;
    vm.isSaving = false;
    vm.pollEditTemplate = pollEditTemplate;
    vm.reorderPoll = reorderPoll;
    
    activate();
    
    function activate() {      
      // When returning to this state from child states, it's necessary
      // to set the group again so that changes are reflected in vm.
      $scope.$on('$stateChangeSuccess',
        function(event, toState, toParams, fromState, fromParams) {
          if (toState.name === 'myPolls.collections.editPolls'
              && vm.group)
            _setGroup(vm.group);
        }
      );
      
      myPollsService.getGroup(
        $stateParams.collectionId, 
        $stateParams.groupId
      ).then(_setGroup);
      
      $anchorScroll('top');
    }
    
    function addPoll() {
      $state.go('myPolls.collections.editPolls.addPoll', {
        group: vm.group
      });
    }
    
    function deletePoll(index) {
      var poll = vm.polls[index];
      $mdDialog.show(
        $mdDialog.confirm()
          .title('Delete Poll')
          .content('Are you sure you would like to delete Poll ' + (index + 1) + '?')
          .ok('Yes')
          .cancel('No')
      ).then(function() {
        vm.polls.splice(index, 1);
        myPollsService.deletePoll(poll, poll._isNew);
      });
    }
      
    function pollEditTemplate(poll) {
      return 'plugins/' + poll.type + '/' + poll.type + '.poll.edit.html';
    }
    
    function reorderPoll(fromIndex, toIndex) {
      if (toIndex < 0 || toIndex >= vm.polls.length)
        return;
      var poll1 = vm.polls[fromIndex],
          poll2 = vm.polls[toIndex];
      myPollsService.swapPolls(poll1, poll2)
      vm.polls[fromIndex] = poll2;
      vm.polls[toIndex] = poll1;
      $anchorScroll('poll-' + toIndex);
    }
    
    function _setGroup(group) {
      vm.group = group;
      vm.polls = _.filter(group.polls, function(poll) {
        return !angular.isDate(poll.deleted);
      });
      shell.setTitle($scope, group.collection.name + ' - ' + group.name);
      shell.setBack(
        $scope,
        'myPolls.collections.viewCollection', 
        { collectionId: group.collection._id }
      );
      vm.activating = false;
    }
    
  }
  
})();