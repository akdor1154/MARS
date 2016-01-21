(function() {
  'use strict';

  angular
    .module('app', [
      'ngMaterial', 
      'ngMessages',
      'ngSanitize',
      'ngFileSaver',
      'ui.router',
      
      'app.data',
      'app.debounce',
      'app.inflector',
      'app.logger',
      'app.plugins',
      'app.templates',
      'app.theme',
      
      'app.auth',
      'app.poll',
      'app.result',
      'app.myPolls',
      
      'plugins.bar-chart',
      'plugins.multiple-choice',
      'plugins.word-cloud'
    ]);
    
})();