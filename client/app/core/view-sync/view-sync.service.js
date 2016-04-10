(function() {
'use strict';
  
  angular
    .module('app.viewSync')
    .factory('viewSyncService', viewSyncService);
      
  viewSyncService.$inject = ['$log', '$rootScope', '$state', 'marsService'];
    
  function viewSyncService($log, $rootScope, $state, marsService) {
    $log = $log.getInstance('viewSyncService');
    
    var enabled = false
      , ignoredStates = []
      , syncInProgress = null;
    
    $rootScope.$on('$stateChangeSuccess', _onStateChangeSuccess);
    marsService.on('user view sync', _onUserViewSync);
    
    return {
      disable: disable,
      enable: enable,
      ignoreStates: ignoreStates,
      isEnabled: isEnabled
    };
    
    function disable() {
      enabled = false;
    }
    
    function enable() {
      enabled = true;
    }
    
    function ignoreStates(states) {
      states = angular.isArray(states) ? states : [states]; 
      ignoredStates = _.union(ignoredStates, states);
    }
    
    function isEnabled() {
      return enabled;
    }
    
    function _onStateChangeSuccess(event, toState, toParams, fromState, fromParams) {
      if (!enabled)
        return;
      if (syncInProgress) {
        if (toState.name === syncInProgress.state) {
          syncInProgress = null;
          $log.debug('Synchronization complete');
        }
      }
      else if (!_.contains(ignoredStates, toState.name)) {
        var data = {
          state: toState.name,
          stateParams: toParams
        };
        $log.info('Sending view synchronization: ', data);
        marsService.request('user view sync', data);
      }
    }
    
    function _onUserViewSync(event, data) {
      if (!enabled)
        return;
      $log.info('Received view synchronization: ', data);
      syncInProgress = data;
      $state.go(data.state, data.stateParams);
    }
  }
  
})();