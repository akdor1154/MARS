(function() {
'use strict';
  
  angular
    .module('app.myPolls')
    .controller('UpdateLeaderboardController', UpdateLeaderboardController);
      
  UpdateLeaderboardController.$inject = [
    '$log',
    '$injector',
    '$mdDialog',
    '$q', 
    'plugins',
    'PLUGIN',
    'myPollsService', 
    'collection'
  ];
    
  function UpdateLeaderboardController(
      $log,
      $injector,
      $mdDialog,
      $q,
      plugins,
      PLUGIN,
      myPollsService,
      collection
    ) {
    $log = $log.getInstance('UpdateLeaderboardController');
    
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
      vm.action = "Updating";
      var selectedPolls = getSelectedPollIds(vm.selectedPolls);
      prepareLeadboard(selectedPolls);
      myPollsService.getResults(selectedPolls)
        .then(groupResponsesByPoll)
        .then(calculateScoresByPoll)
        .then(function(leaderboard) {
          _.extend(vm.collection.leaderboard, leaderboard);
          return myPollsService.updateCollection(vm.collection, 'leaderboard');
        })
        .then(function() {
          $mdDialog.hide();
        })
        .catch(function(err) {
          $log.error('Updating failed: ', err);
        });
    }
    
    function calculateScoresByPoll(responsesByPoll) {
      var scores = {};
      var pollsById = getPollsById();
      var leaderboardPlugins = _.indexBy(
        plugins.registered(PLUGIN.LEADERBOARD),
        'name'
      );
      _.each(responsesByPoll, function(responses, pollId) {
        var poll = pollsById[pollId];
        var plugin = leaderboardPlugins[poll.type];
        if (!plugin)
          return;
        var calculateScores = $injector.get(plugin.options.factory);
        scores[pollId] = calculateScores(poll, responses);
      });
      return scores;
    }
    
    function getPollsById() {
      return _.indexBy(
        [].concat.apply([], _.pluck(vm.collection.groups, 'polls')),
        '_id'
      );
    }
    
    function groupResponsesByPoll(results) {
      var responsesByPoll = {};
      _.each(results, function(result) {
        var responses = responsesByPoll[result.poll] || [];
        responsesByPoll[result.poll] = responses.concat(result.responses);
      });
      return responsesByPoll;
    }
    
    function getSelectedPollIds(selectedPolls) {
      var pollIds = [];
      _.each(selectedPolls, function(selected, pollId) {
        if (selected)
          pollIds.push(pollId);
      });
      return pollIds;
    }
    
    function prepareLeadboard(selectedPolls) {
      vm.collection.leaderboard = {};
      _.each(selectedPolls, function(pollId) {
        vm.collection.leaderboard[pollId] = {};
      });
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