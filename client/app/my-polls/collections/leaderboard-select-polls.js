(function() {
'use strict';
  
  angular
    .module('app.myPolls')
    .controller('LeaderboardSelectPollsController', LeaderboardSelectPollsController);
      
  LeaderboardSelectPollsController.$inject = [
    '$log',
    '$mdDialog',
    'collection'
  ];
    
  function LeaderboardSelectPollsController(
      $log,
      $mdDialog,
      collection
    ) {
    $log = $log.getInstance('LeaderboardSelectPollsController');
    
    /* jshint validthis: true */
    var vm = this;
    
    vm.areAllSelected = areAllSelected;
    vm.cancel = cancel;
    vm.collection = collection; 
    vm.toggleSelectAll = toggleSelectAll;
    vm.selectedPolls = {};
    vm.update = update;
    
    activate();
    
    function activate() {
      // Select polls that are already included in the leaderboard
      _.each(vm.collection.leaderboard, function(responses, pollId) {
        vm.selectedPolls[pollId] = true;
      });
    }
    
    function areAllSelected() {
      return !_.some(getAllPolls(), function(poll) {
        return !vm.selectedPolls[poll._id];
      });
    }
    
    function cancel() {
      $mdDialog.cancel();
    }
    
    function getAllPolls() {
      return _.flatten(
        _.pluck(vm.collection.groups, 'polls'),
        true
      );
    }
    
    function update() {
      vm.collection.leaderboard = {};
      _.each(vm.selectedPolls, function(selected, pollId) {
        if (selected)
          vm.collection.leaderboard[pollId] = {};
      });
      $mdDialog.hide();
    }
    
    function toggleSelectAll() {
      var selectAll = !areAllSelected();
      _.each(
        getAllPolls(),
        function(poll) {
          vm.selectedPolls[poll._id] = selectAll;
        }
      );
    }
    
  }
  
})();