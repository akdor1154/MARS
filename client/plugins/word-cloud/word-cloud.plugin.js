(function() {
  'use strict';
  
  angular
    .module('plugins.word-cloud', ['app.plugins', 'app.data'])
    .config(config);
    
  
  config.$inject = ['pluginsProvider', 'PLUGIN'];
  
  function config(pluginsProvider, PLUGIN) {
    
    pluginsProvider.register(PLUGIN.POLL_TYPE, 'word-cloud', true);
    pluginsProvider.register(PLUGIN.RESULT_TYPE, 'word-cloud', true);
    pluginsProvider.register(PLUGIN.RESULT_EXPORTERS, 'word-cloud', [
      {
        name: 'All Responses',
        extension: '.csv',
        factory: 'wordCloudResultExportAllResponsesCsv'
      },
      {
        name: 'Final Responses',
        extension: '.csv',
        factory: 'wordCloudResultExportFinalResponsesCsv'
      },
    ]);
    
  }
  
})();