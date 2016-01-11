(function() {
  'use strict';
  
  angular
    .module('app.poll')
    .controller('PollController', PollController);
    
  
  PollController.$inject = [
    '$log', 
    '$mdDialog',
    '$scope',
    '$state',
    '$stateParams',
    'auth',
    'plugins', 
    'PLUGIN_ACTIONS',
    'pollService',
  ];
  
  function PollController(
      $log, 
      $mdDialog,
      $scope, 
      $state, 
      $stateParams, 
      auth, 
      plugins, 
      PLUGIN_ACTIONS, 
      pollService
    ) {
    $log = $log.getInstance('PollController');
    
    /* jshint validthis: true */
    var vm = this;
    
    vm.closePreview = closePreview;
    vm.logout = logout;
    vm.isPreview = false;
    vm.multiplePollsActive = false;
    vm.nextPoll = nextPoll;
    vm.showSubscribeDialog = showSubscribeDialog;
    
    activate();
    
    function activate() {
      auth.isAuthenticated().then(function(user) {
        if (user.group === 'poller' && !$stateParams.preview)
          return $state.go('myPolls');
        pollService.onActivePollsChanged($scope, _onActivePollsChanged);
        pollService.getActivePolls();
        vm.isPreview = $stateParams.preview;
      }, function(err) {
        return $state.go('auth.login');
      });  
    }
    
    function closePreview() {
      vm.isPreview = false;
      $state.go('myPolls');
    }
    
    function logout() {
      auth.logout();
    }
    
    function nextPoll() {
      var active = pollService.nextActivePoll();
      _viewPoll(active);
    }
    
    function showSubscribeDialog(event) {
      $mdDialog.show({
        templateUrl: 'app/poll/poll.subscribe.html',
        controller: 'PollSubscribeController as vm',
        targetEvent: event
      }).then(function() {
        pollService.getActivePolls();
      });
    }
    
    function _onActivePollsChanged(event, count) {
      var active = pollService.activePoll();
      $log.debug('Active poll: ', active);
      _viewPoll(active);
      vm.multiplePollsActive = count > 1;
    }
    
    function _viewPoll(result) {
      if (result === null) {
        $state.go('poll.none');
      }
      else {
        vm.poll = result.poll;
        vm.result = result;
        $state.go('poll.view');
      }
    }
    
  }
  
})();