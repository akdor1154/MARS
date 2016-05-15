(function() {
  'use strict';
  
  angular
    .module('plugins.multiple-choice', ['app.plugins', 'app.data'])
    .config(config);
    
  
  config.$inject = ['pluginsProvider', 'PLUGIN'];
  
  function config(pluginsProvider, PLUGIN) {
    
    pluginsProvider.register(PLUGIN.POLL_TYPE, 'multiple-choice', true);
    pluginsProvider.register(PLUGIN.RESULT_TYPE, 'multiple-choice', true);
    pluginsProvider.register(PLUGIN.LEADERBOARD, 'multiple-choice', { 
      factory: 'multipleChoiceLeaderboard'
    });
    pluginsProvider.register(PLUGIN.RESULT_EXPORTERS, 'multiple-choice', [
      {
        name: 'All Responses',
        extension: '.csv',
        factory: 'multipleChoiceResultExportAllResponsesCsv'
      },
      {
        name: 'Final Responses',
        extension: '.csv',
        factory: 'multipleChoiceResultExportFinalResponsesCsv'
      },
      {
        name: 'Answer Breakdown',
        extension: '.csv',
        factory: 'multipleChoiceResultExportAnswerBreakdown'
      },
    ]);
    
  }
  
})();