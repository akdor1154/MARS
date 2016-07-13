(function() {
  'use strict';
  
  angular
    .module('app.myPolls')
    .controller('SettingsController', SettingsController);
      
  SettingsController.$inject = [
    '$log', 
    '$scope',
    'shell',  
    'localStorageService',
    'viewSyncService'
  ];
    
  function SettingsController(
      $log, 
      $scope, 
      shell, 
      localStorageService,
      viewSyncService
  ) {
    
    $log = $log.getInstance('SettingsController');
    
    /* jshint validthis: true */
    var vm = this;
    
    vm.shell = shell;
    vm.isViewSynchronized = false;
    vm.toggleViewSync = toggleViewSync;

    activate();
    
    function activate() {
      shell.setTitle($scope, 'Settings');
      
      // Need to read from LocalStorage - on refresh we cannot rely on  
      // race between viewSyncService.isEnabled()'s default value and 
      // ShellController setting the correct value.
      var isViewSynchronized = 
        localStorageService.get('myPolls.settings.isViewSynchronized');
      vm.isViewSynchronized = isViewSynchronized !== null
        ? isViewSynchronized 
        : true;
    }

    function toggleViewSync() {
      viewSyncService.isEnabled()
        ? viewSyncService.disable()
        : viewSyncService.enable();
      localStorageService.set(
        'myPolls.settings.isViewSynchronized', 
        vm.isViewSynchronized
      );
    }

  }
  
})();