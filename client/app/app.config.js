(function() {
  'use strict';
  
  angular
    .module('app')
    .config(config);
    
  config.$inject = [
    '$anchorScrollProvider',
    '$logProvider',
    '$urlRouterProvider',
    'localStorageServiceProvider'
  ];
  
  function config(
      $anchorScrollProvider,
      $logProvider,
      $urlRouterProvider,
      localStorageServiceProvider
    ) {
    
    // Set default route
    $urlRouterProvider.otherwise("/")
    
    // Disable auto scrolling based on location.hash
    $anchorScrollProvider.disableAutoScrolling();
    
    // Turn off debug logging
    $logProvider.debugEnabled(false);
    
    // Configure prefix for localStorage
    localStorageServiceProvider
      .setPrefix('mars');
  }

  
})();