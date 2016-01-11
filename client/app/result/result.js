(function() {
  'use strict';
  
  angular
    .module('app.result')
    .controller('ResultController', ResultController);
    
  ResultController.$inject = [
    '$log', 
    '$scope',
    '$state', 
    '$stateParams',
    '$mdDialog',
    'auth',
    'plugins',
    'PLUGIN_ACTIONS',
    'resultService'
  ];
  
  function ResultController(
      $log, 
      $scope, 
      $state, 
      $stateParams,
      $mdDialog,
      auth, 
      plugins,
      PLUGIN_ACTIONS, 
      resultService) {
    $log = $log.getInstance('ResultController');
    
    var vm = this;
    
    vm.close = close;
    vm.isOwner = false;
    vm.poll = null;
    vm.result = null;
    vm.resultViewTemplate = resultViewTemplate;
    vm.resume = resume;
    vm.resumePast = resumePast;
    vm.showClose = false;
    vm.toast = null;
    
    var closeState = null
      , closeStateParams = null;
    
    activate();
    
    function activate() {
      closeState = $stateParams.closeState
        || $scope.previousState.name;
      closeStateParams = $stateParams.closeStateParams
        || $scope.previousStateParams;
      $log.debug('closeState = ', closeState);
      $log.debug('closeStateParams = ', closeStateParams);
      
      auth.isAuthenticated().then(function(user) {
        var resultId = $stateParams.resultId;
        resultService.subscribe(resultId)
          .then(function(result) {
            $log.debug('result = ', result);
            vm.poll = result.poll;
            vm.result = result;
            vm.isOwner = _.contains(result.pollCollection.owners, user._id);
            return resultService.getActivations(result.poll._id);
          })
          .then(function(activations) {
            vm.pastResults = _.filter(activations, function(a) {
              return a._id != vm.result._id;
            });
          }).catch(function(err) {
            $log.error(err);
            if (err.code && err.code === 404)
              $mdDialog.show(
                $mdDialog.alert()
                  .title('Not Found')
                  .content('The result does not exist')
                  .ok('Go Back')
              )/*.then(close)*/;
          });
      });
    }
    
    function close() {
      $log.debug('close');
      if (!closeState)
        closeState = 'myPolls';
      $log.debug('closeState = ', closeState);
      $log.debug('closeStateParams = ', closeStateParams);
      $state.go(closeState, closeStateParams);
    }
    
    function resultViewTemplate(poll) {
      return 'plugins/' + result.type + '/' + result.type + '.result.edit.html';
    }
    
    function resume(result) {
      resultService.resume(result._id).then(function(resumedResult) {
        result.activations = resumedResult.activations;
        result.active = true;
      });
    }
    
    function resumePast(pastResult) {
      var fromId = vm.result.active ? vm.result._id : false;
      resultService.resume(pastResult._id, fromId)
        .then(function(resumedResult) {
          vm.result.active = false;
          $state.go('result', { 
            resultId: resumedResult._id,
            closeState: closeState,
            closeStateParams: closeStateParams
          });
        });
    }
    
    $scope.$on('$destroy', function() {
      // $log.debug('Deactivating: ', $stateParams.resultId);
      if (vm.isOwner && vm.result.active)
        resultService.deactivate(vm.result._id);
    });
    
  }
  
})();