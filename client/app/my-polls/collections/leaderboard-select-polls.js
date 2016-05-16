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
    
    function cancel() {
      $mdDialog.cancel();
    }
    
    function update() {
      vm.collection.leaderboard = {};
      _.each(vm.selectedPolls, function(selected, pollId) {
        if (selected)
          vm.collection.leaderboard[pollId] = {};
      });
      $mdDialog.hide();
      // vm.action = "Updating";
      // var selectedPolls = getSelectedPollIds(vm.selectedPolls);
      // prepareLeadboard(selectedPolls);
      // myPollsService.getResults(selectedPolls)
      //   .then(groupResponsesByPoll)
      //   .then(calculateScoresByPoll)
      //   .then(function(leaderboard) {
      //     _.extend(vm.collection.leaderboard, leaderboard);
      //     return myPollsService.updateCollection(vm.collection, 'leaderboard');
      //   })
      //   .then(function() {
      //     $mdDialog.hide();
      //   })
      //   .catch(function(err) {
      //     $log.error('Updating failed: ', err);
      //   });
    }
    
    function toggleSelectAll() {
      _.each(
        [].concat.apply([], _.pluck(vm.collection.groups, 'polls')),
        function(poll) {
          vm.selectedPolls[poll._id] = vm.selectAll;
        }
      );
    }
    
  }
  
})();