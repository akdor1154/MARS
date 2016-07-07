(function() {
  'use strict';

  angular
    .module('plugins.annotate', ['app.plugins', 'app.data'])
    .config(config);


  config.$inject = ['pluginsProvider', 'PLUGIN'];

  function config(pluginsProvider, PLUGIN) {

    pluginsProvider.register(PLUGIN.POLL_TYPE, 'annotate', true);
    pluginsProvider.register(PLUGIN.RESULT_TYPE, 'annotate', true);

  }

})();
