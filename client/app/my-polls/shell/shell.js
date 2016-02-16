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
    'shell',
    'myPollsService'
  ];
    
  function ShellController(
      $log,
      $state,
      $mdDialog,
      $mdSidenav,
      $window,
      auth,
      shell,
      myPollsService
    ) {
    $log = $log.getInstance('ShellController');
    
    /* jshint validthis: true */
    var vm = this;
    
    vm.action = null;
    vm.addCollection = addCollection;
    vm.collections = null;
    vm.goBack = goBack;
    vm.goToState = goToState;
    vm.logout = logout;
    vm.openLeftMenu = openLeftMenu;
    vm.openExternal = openExternal;
    vm.shell = shell;
    
    activate();
    
    function activate() {
      auth.isAuthenticated().then(function(user) {
        if (user.group !== 'poller')
          return $state.go('auth.forbidden');
        
        vm.action = 'Loading';
        myPollsService.getCollections().then(function(collections) {
          vm.action = null;
          vm.collections = collections;
          if (collections.length === 0)
            return $state.go('myPolls.help.gettingStarted');
        });
        
      }, function(err) {
        $state.go('auth.login');
      })
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
    
    function goBack() {
      $state.go(vm.shell.back.state, vm.shell.back.stateParams);
    }
    
    function goToState(state, params) {
      $state.go(state, params);
      $mdSidenav('left').close();
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