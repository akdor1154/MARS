(function() {
  'use strict';
  
  angular
    .module('app.myPolls')
    .controller('UpcomingController', UpcomingController);
      
  UpcomingController.$inject = [
    '$log', 
    '$anchorScroll',
    '$scope',
    '$state',
    'shell',  
    'myPollsService'
  ];
    
  function UpcomingController($log, $anchorScroll, $scope, $state, shell, myPollsService) {
    $log = $log.getInstance('UpcomingController');
    
    /* jshint validthis: true */
    var vm = this;
    
    vm.filteredGroups = null;
    vm.groups = null;
    vm.markGroupAsDone = markGroupAsDone;
    vm.viewResult = viewResult;
    
    activate();
    
    function activate() {
      shell.setTitle($scope, 'Upcoming Polls');
      shell.setSearch($scope, _searchCallback);
      myPollsService.getCollections().then(function(collections) {
        vm.groups = _upcomingGroups(collections);
        _searchCallback();
      });
      $anchorScroll('top');
    }
    
    
    function markGroupAsDone(index) {
      var group = vm.groups.splice(index, 1);
      if (group.length === 0)
        return;
      group = group[0];
      group.upcoming = null;
      myPollsService.updateGroup(group, 'upcoming');
    }
    
    function viewResult(poll) {
      $log.debug('viewResult: ', poll._id);
      var resultCallback = function(result) {
        $state.go('result', { resultId: result._id, mode: 'live' });
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
    
    function _upcomingGroups(collections) {
      var now = new Date();
      var groups = _.pluck(collections, 'groups');
      return _.filter(
        _.flatten(_.zip.apply(null, groups)), function(group) {
          return _.has(group, 'upcoming') 
            && angular.isDate(group.upcoming) 
            && !angular.isDate(group.deleted);
        });
    }
    
  }
  
})();