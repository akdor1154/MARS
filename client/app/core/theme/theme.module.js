(function() {
  'use strict';
  
  angular
    .module('app.theme', [])
    .config(config);
    
  
  config.$inject = ['$mdThemingProvider'];
  
  function config($mdThemingProvider) {
    
    // Define theme colorscheme
    $mdThemingProvider
      .theme('default')
      .primaryPalette('blue')
      .accentPalette('pink')
      .backgroundPalette('grey', {
        'hue-1': '100'
      })

    $mdThemingProvider
      .theme('secondary')
      .backgroundPalette('blue')
      .dark();
      
    $mdThemingProvider
      .definePalette('searchPalette', 
        $mdThemingProvider.extendPalette('grey', {
          'contrastDefaultColor': 'light',
          'contrastDarkColors': ['50'],
          '50': 'ffffff'
        })
      );
      
    $mdThemingProvider
      .theme('search')
      .primaryPalette('searchPalette', {
        'default': '400',
        'hue-1': '50'
      });
      
  }
  
})();