(function() {
  'use strict';
  
  angular
    .module('app.poll')
    .config(statesConfig);
      
  statesConfig.$inject = ['$stateProvider'];
    
  function statesConfig($stateProvider) {
    $stateProvider
      .state('poll', {
        url: '/',
        params: { preview: { type: Boolean, default: false }},
        templateUrl: 'app/poll/poll.html',
        controller: 'PollController as vm'
      })
      .state('poll.none', {
        templateUrl: 'app/poll/poll.none.html'
      })
      .state('poll.view', {
        templateUrl: 'app/poll/poll.view.html'
      })
  }
  
})();