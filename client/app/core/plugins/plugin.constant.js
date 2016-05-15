(function() {
  'use strict';
  
  angular
    .module('app.plugins')
    .constant('PLUGIN', {
      'POLL_TYPE': 'POLL_TYPE',
      'RESULT_TYPE': 'RESULT_TYPE',
      'LEADERBOARD': 'LEADERBOARD',
      'RESULT_EXPORTERS': 'RESULT_EXPORTERS'
    })
    .constant('PLUGIN_ACTIONS', {
      'POLL_VIEW': 'POLL_VIEW',
      'POLL_EDIT': 'POLL_EDIT',
      'RESULT_VIEW': 'RESULT_VIEW'
    })
    .constant('PLUGIN_ACTIONS_MAP', {
      'POLL_TYPE': ['POLL_VIEW', 'POLL_EDIT'],
      'RESULT_TYPE': ['RESULT_VIEW']
    })
    .constant('PLUGIN_VIEWS', {
      'POLL_VIEW': 'poll.view',
      'POLL_EDIT': 'poll.edit',
      'RESULT_VIEW': 'result.view'
    });
  
})();