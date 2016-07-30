(function() {
  'use strict';

  angular
    .module('plugins.queue', ['app.plugins', 'app.data'])
    .config(config);


  config.$inject = ['pluginsProvider', 'PLUGIN'];

  function config(pluginsProvider, PLUGIN) {

    pluginsProvider.register(PLUGIN.POLL_TYPE, 'queue', true);
    pluginsProvider.register(PLUGIN.RESULT_TYPE, 'queue', true);

  }

})();
