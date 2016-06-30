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
    
    vm.logout = logout;
    vm.multiplePollsActive = false;
    vm.nextPoll = nextPoll;
    vm.showMyDisplayNameDialog = showMyDisplayNameDialog;
    vm.showMyFeedsDialog = showMyFeedsDialog;
    vm.showSubscribeDialog = showSubscribeDialog;
    
    activate();
    
    function activate() {
      auth.isAuthenticated().then(function(user) {
        pollService.onActivePollsChanged($scope, _onActivePollsChanged);
        pollService.getActivePolls();
      }, function(err) {
        return $state.go('auth.login');
      });  
    }
    
    function logout() {
      $state.go('auth.logout');
    }
    
    function nextPoll() {
      var active = pollService.nextActivePoll();
      _viewPoll(active);
    }
    
    function showMyDisplayNameDialog() {
      $mdDialog.show({
        templateUrl: 'app/poll/my-display-name.html',
        controller: 'MyDisplayNameController as vm'
      });
    }
    
    function showMyFeedsDialog() {
      $mdDialog.show({
        templateUrl: 'app/poll/my-feeds.html',
        controller: 'MyFeedsController as vm'
      });
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
        vm.poll = null;
        vm.result = null;
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