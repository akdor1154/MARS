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
    vm.createResult = createResult;
    vm.isOwner = false;
    vm.poll = null;
    vm.result = null;
    vm.resultViewTemplate = resultViewTemplate;
    vm.resume = resume;
    vm.showClose = false;
    vm.toast = null;
    vm.toggleActive = toggleActive;
    vm.viewResult = viewResult;
    
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
            resultService.onResultActivate($scope, onResultActivate);
            resultService.onResultDeactivate($scope, onResultDeactivate);
            return resultService.getActivations(result.poll._id);
          })
          .then(function(activations) {
            vm.pastResults = _.filter(activations, function(a) {
              return a._id != vm.result._id
                  && a.responsesCount > 0;
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
    
    function createResult() {
      return resultService.createResult(vm.poll._id).then(viewResult);
    }
    
    function deactivate(result) {
      if (!result.active)
        return;
      resultService.deactivate(result._id).then(function() {
        result.active = false;
      });
    }
    
    function onResultActivate(event, result) {
      if (result._id === vm.result._id)
        vm.result.active = true;
    }
    
    function onResultDeactivate(event, result) {
      if (result._id === vm.result._id)
        vm.result.active = false;
    }
    
    function resultViewTemplate(poll) {
      return 'plugins/' + result.type + '/' + result.type + '.result.edit.html';
    }
    
    function resume(result) {
      if (result.active)
        return;
      resultService.resume(result._id).then(function(resumedResult) {
        result.activations = resumedResult.activations;
        result.active = true;
      });
    }
    
    function toggleActive() {
      vm.result.active
        ? deactivate(vm.result)
        : resume(vm.result);
    }
    
    function viewResult(result) {
      $state.go('result', { 
        resultId: result._id,
        closeState: closeState,
        closeStateParams: closeStateParams
      });
      // var fromId = vm.result.active ? vm.result._id : false;
      // resultService.resume(pastResult._id, fromId)
        // .then(function(resumedResult) {
          // vm.result.active = false;
          // $state.go('result', { 
            // resultId: resumedResult._id,
            // closeState: closeState,
            // closeStateParams: closeStateParams
          // });
        // });
    }
    
    $scope.$on('$destroy', function() {
      // $log.debug('Deactivating: ', $stateParams.resultId);
      if (vm.isOwner && vm.result.active)
        resultService.deactivate(vm.result._id);
    });
    
  }
  
})();