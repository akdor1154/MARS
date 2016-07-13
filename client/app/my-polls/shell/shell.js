(function() {
  'use strict';
  
  angular
    .module('app.myPolls')
    .controller('ShellController', ShellController);
      
  ShellController.$inject = [
    '$log', 
    '$state', 
    '$mdDialog',
    '$mdSidenav',
    '$window',
    'auth',
    'localStorageService',
    'shell',
    'viewSyncService',
    'myPollsService'
  ];
    
  function ShellController(
      $log,
      $state,
      $mdDialog,
      $mdSidenav,
      $window,
      auth,
      localStorageService,
      shell,
      viewSyncService,
      myPollsService
    ) {
    $log = $log.getInstance('ShellController');
    
    /* jshint validthis: true */
    var vm = this;
    
    vm.action = null;
    vm.goToAudienceMode = goToAudienceMode;
    vm.addCollection = addCollection;
    vm.collections = null;
    vm.goBack = goBack;
    vm.goToState = goToState;
    vm.isState = isState;
    vm.logout = logout;
    vm.openLeftMenu = openLeftMenu;
    vm.openExternal = openExternal;
    vm.shell = shell;
    
    activate();
    
    function activate() {
      auth.isAuthenticated().then(function(user) {
        if (user.group !== 'poller')
          return $state.go('auth.forbidden');
                
        viewSyncService.ignoreStates([
          'myPolls.collections.viewCollection.cloneCollection',
          'myPolls.collections.viewCollection.editCollection',
          'myPolls.collections.viewCollection.addGroup',
          'myPolls.collections.viewCollection.editGroup',
          'myPolls.collections.viewCollection.exportResults',
          'myPolls.collections.editPolls',
          'myPolls.collections.editPolls.addPoll',
          'myPolls.archive.exportResults',
        ]);
        var isViewSynchronized = 
          localStorageService.get('myPolls.settings.isViewSynchronized');
        isViewSynchronized = isViewSynchronized !== null
          ? isViewSynchronized 
          : true;
        isViewSynchronized
          ? viewSyncService.enable()
          : viewSyncService.disable();
        
        vm.action = 'Loading';
        myPollsService.getCollections().then(function(collections) {
          vm.action = null;
          vm.collections = collections;
          if (collections.length === 0)
            return $state.go('myPolls.help.gettingStarted');
        });
        
      }, function(err) {
        $state.go('auth.login');
      });
    }
    
    function addCollection() {
      $mdDialog.show({
        templateUrl: 'app/my-polls/shell/add-collection.html',
        controller: 'AddCollectionController as vm'
      }).then(function(collection) {
        $mdSidenav('left').toggle();
        $state.go('myPolls.collections.viewCollection', { 
          collectionId: collection._id 
        });
      });
    }
    
    function goToAudienceMode() {
      viewSyncService.disable();
      $state.go('poll')
    }
    
    function goBack() {
      $state.go(vm.shell.back.state, vm.shell.back.stateParams);
    }
    
    function goToState(state, params) {
      $state.go(state, params);
      $mdSidenav('left').close();
    }
    
    function isState(stateName, stateParams) {
      var result = $state.current.name.lastIndexOf(stateName, 0) === 0;
      if (stateParams)
        result &= _.matcher(stateParams)($state.params);
      return result;
    }
    
    function logout() {
      $state.go('auth.logout');
    }
    
    function openLeftMenu() {
      $mdSidenav('left').toggle();
    }
    
    function openExternal (url) {
      $window.open(url, '', 'width=640, height=480');
    }
  }
  
})();