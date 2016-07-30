(function() {
  'use strict';

  angular
    .module('app', [
      'ngMaterial',
      'ngMessages',
      'ngSanitize',
      'angular-clipboard',
      'LocalStorageModule',
      'ngFileSaver',
      'md.data.table',
      'ui.router',

      'app.data',
      'app.debounce',
      'app.inflector',
      'app.logger',
      'app.plugins',
      'app.templates',
      'app.theme',
      'app.viewSync',

      'app.auth',
      'app.poll',
      'app.result',
      'app.myPolls',

      'plugins.bar-chart',
      'plugins.multiple-choice',
      'plugins.word-cloud',
      'plugins.annotate',
      'plugins.queue'
    ]);

})();
