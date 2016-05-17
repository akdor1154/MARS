(function() {
'use strict';
  
  angular
    .module('app.myPolls')
    .controller('LeaderboardController', LeaderboardController);
      
  LeaderboardController.$inject = [
    '$log', 
    '$anchorScroll',
    '$injector',
    '$mdDialog', 
    '$scope', 
    '$stateParams', 
    'PLUGIN',
    'plugins',
    'myPollsService',
    'shell'
  ];
    
  function LeaderboardController(
      $log, 
      $anchorScroll,
      $injector,
      $mdDialog, 
      $scope, 
      $stateParams,
      PLUGIN,
      plugins, 
      myPollsService,
      shell
    ) {
    $log = $log.getInstance('LeaderboardController');
    
    /* jshint validthis: true */
    var vm = this;
    
    vm.collection = null;
    vm.getUserName = getUserName;
    vm.leaderboard = null; 
    vm.showSelectPollsDialog = showSelectPollsDialog;
    vm.subscribers = [];
    vm.updateLeaderboard = updateLeaderboard;
    vm.updateLeaderboardPromise = null;
    
    activate();
    
    function activate() {
      vm.updateLeaderboardPromise = 
        myPollsService.getCollection($stateParams.collectionId)
          .then(setCollection)
          .then(updateSubscribers)
          .then(function() {
            renderLeaderboard(vm.collection.leaderboard);
          });
      $anchorScroll('top');
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
    
    function getSelectedPollIds(selectedPolls) {
      var pollIds = [];
      _.each(selectedPolls, function(selected, pollId) {
        if (selected)
          pollIds.push(pollId);
      });
      return pollIds;
    }
    
    function getUserName(userId) {
      var user = vm.subscribers[userId];
      return user && !user.name.anonymous
        ? user.name.display
          ? user.name.display
          : user.name.first + ' ' + user.name.last
        : 'Anonymous';
    }
    
    function groupResponsesByPoll(results) {
      var responsesByPoll = {};
      _.each(results, function(result) {
        var responses = responsesByPoll[result.poll] || [];
        responsesByPoll[result.poll] = responses.concat(result.responses);
      });
      return responsesByPoll;
    }
    
    function prepareNewLeadboard(pollIds) {
      var leaderboard = {};
      _.each(pollIds, function(pollId) {
        leaderboard[pollId] = {};
      });
      return leaderboard;
    }
    
    function renderLeaderboard(scoresByPoll) {
      vm.leaderboard = sumScoresByUser(scoresByPoll);
    }
    
    function setCollection(collection) {
      $log.debug('collection = ', collection);
      shell.setTitle($scope, 'Leaderboard: ' + collection.name);
      shell.setBack($scope, 'myPolls.collections.viewCollection', $stateParams);
      shell.setMenu($scope, [
        { 
          label: 'Select Polls', 
          callback: showSelectPollsDialog, 
          icon: 'polls' 
        },
        { 
          label: 'Update Leaderboard', 
          callback: updateLeaderboard, 
          icon: 'refresh' 
        }
      ]);
      vm.collection = collection;
    }
    
    function showSelectPollsDialog() {
      return $mdDialog.show({
        templateUrl: 'app/my-polls/collections/leaderboard-select-polls.html',
        controller: 'LeaderboardSelectPollsController as vm',
        locals: { collection: vm.collection }
      }).then(function() {
        updateLeaderboard();
      });
    }
    
    function storeLeaderboard(scoresByPoll) {
      _.extend(vm.collection.leaderboard, scoresByPoll);
      return myPollsService.updateCollection(vm.collection, 'leaderboard');
    }
    
    function sumScoresByUser(scoresByPoll) {
      var scoresByUser = {};
      _.each(scoresByPoll, function(scores) {
        _.each(scores, function(score, userId) {
          scoresByUser[userId] = scoresByUser[userId] || {
            user: getUserName(userId),
            score: 0
          };
          scoresByUser[userId].score += score;
        });
      });
      return _.values(scoresByUser);
    }
    
    function updateLeaderboard() {
      var pollIds = _.keys(vm.collection.leaderboard);
      var leaderboard = vm.collection.leaderboard; 
      vm.leaderboard = null;
      vm.updateLeaderboardPromise = myPollsService.getResults(pollIds)
        .then(groupResponsesByPoll)
        .then(calculateScoresByPoll)
        .then(function(scoresByPoll) {
          renderLeaderboard(scoresByPoll);
          return storeLeaderboard(scoresByPoll);
        });
      return vm.updateLeaderboardPromise;
    }
    
    function updateSubscribers() {
      return myPollsService.listSubscribers(vm.collection._id)
        .then(function(subscribers) {
          vm.subscribers = _.indexBy(subscribers, '_id');
        });
    }
    
  }
  
})();
