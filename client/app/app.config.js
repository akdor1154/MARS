(function() {
  'use strict';
  
  angular
    .module('app')
    .config(config);
    
  config.$inject = [
    '$anchorScrollProvider',
    '$logProvider',
    '$urlRouterProvider'
  ];
  
  function config(
      $anchorScrollProvider,
      $logProvider,
      $urlRouterProvider
    ) {
    
    // Set default route
    $urlRouterProvider.otherwise("/")
    
    // Disable auto scrolling based on location.hash
    $anchorScrollProvider.disableAutoScrolling();
    
    // Turn off debug logging
    $logProvider.debugEnabled(false);
  }

  
})();