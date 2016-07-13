(function() {
  'use strict';
  
  angular
    .module('app.result')
    .config(statesConfig);
      
  statesConfig.$inject = ['$stateProvider'];
  
  function statesConfig($stateProvider) {
    $stateProvider
      .state('result', {
        params: {
          closeState: { type: Object },
          closeStateParams: { type: Object },
        },
        url: '/result/:mode/:resultId',
        templateUrl: 'app/result/result.html',
        controller: 'ResultController as vm'
      })
      .state('result.view', {
        params: {
          poll: { type: Object },
          result: { type: Object }
        },
        template: '<ui-view />',
        // Make state params available on $scope so that plugins can
        // easily access them.
        controller: [
          '$stateParams',
          '$scope',
          function($stateParams, $scope) {
            for(var param in $stateParams)
              $scope[param] = $stateParams[param];
          }
        ]
      })
      .state('result.resume', {
        params: { targetEvent: { type: Object }},
        onEnter: [
            '$log',
            '$state',
            '$stateParams',
            '$mdDialog',
            'resultService',
            function($log, $state, $stateParams, $mdDialog, resultService) {
              var confirm = $mdDialog.confirm()
                .title('No Longer Active')
                .content('The poll you are trying to view results for is no longer active. ')
                .ok('Resume')
                .cancel('Cancel');
              $mdDialog.show(confirm).then(
                // Resume
                function() {
                  resultService.resume($stateParams.resultId).then(
                    function(activation) {
                      $log.debug('activation = ', activation);
                      $state.go('result', { activationId: activation._id });
                    },
                    $log.error
                  );
                },
                // Cancel
                function() {
                  $state.go('myPolls');
                }
              );
            }
          ]
      });
  }
  
})();