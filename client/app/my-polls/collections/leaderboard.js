(function() {
'use strict';
  
  angular
    .module('app.myPolls')
    .controller('LeaderboardController', LeaderboardController);
      
  LeaderboardController.$inject = [
    '$log', 
    '$anchorScroll',
    '$mdDialog', 
    '$scope', 
    '$stateParams', 
    'myPollsService',
    'shell'
  ];
    
  function LeaderboardController(
      $log, 
      $anchorScroll,
      $mdDialog, 
      $scope, 
      $stateParams, 
      myPollsService,
      shell
    ) {
    $log = $log.getInstance('LeaderboardController');
    
    /* jshint validthis: true */
    var vm = this;
    
    vm.collection = null;
    vm.getUserName = getUserName;
    vm.leaderboard = null; 
    vm.showUpdateLeaderboardDialog = showUpdateLeaderboardDialog;
    vm.subscribers = [];
    vm.updateLeaderboardPromise = null;
    
    activate();
    
    function activate() {
      vm.updateLeaderboardPromise = 
        myPollsService.getCollection($stateParams.collectionId)
          .then(_setCollection)
          .then(_updateSubscribers)
          .then(_updateLeaderboard);
      $anchorScroll('top');
    }
    
    function getUserName(userId) {
      var user = vm.subscribers[userId];
      return user && !user.name.anonymous
        ? user.name.display
          ? user.name.display
          : user.name.first + ' ' + user.name.last
        : 'Anonymous';
    }
    
    function showUpdateLeaderboardDialog() {
      vm.updateLeaderboardPromise = $mdDialog.show({
        templateUrl: 'app/my-polls/collections/update-leaderboard.html',
        controller: 'UpdateLeaderboardController as vm',
        locals: { collection: vm.collection }
      }).then(function(leaderboard) {
        _updateLeaderboard();
        $anchorScroll('top');
      });
    }
    
    function _sumScoresByUser(scoresByPoll) {
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
    
    function _setCollection(collection) {
      $log.debug('collection = ', collection);
      shell.setTitle($scope, 'Leaderboard: ' + collection.name);
      shell.setBack($scope, 'myPolls.collections.viewCollection', $stateParams);
      shell.setMenu($scope, [
        { 
          label: 'Update Leaderboard', 
          callback: showUpdateLeaderboardDialog, 
          icon: 'refresh' 
        }
      ]);
      vm.collection = collection;
    }
    
    function _updateLeaderboard() {
      vm.leaderboard = _sumScoresByUser(vm.collection.leaderboard);
    }
    
    function _updateSubscribers() {
      return myPollsService.listSubscribers(vm.collection._id)
        .then(function(subscribers) {
          vm.subscribers = _.indexBy(subscribers, '_id');
        });
    }
    
  }
  
})();
