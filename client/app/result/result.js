(function() {
  'use strict';
  
  angular
    .module('app.result')
    .controller('ResultController', ResultController);
    
  ResultController.$inject = [
    '$log', 
    '$q',
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
      $q,
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
    
    vm.archiveMode = false;
    vm.close = close;
    vm.isOwner = false;
    vm.poll = null;
    vm.result = null;
    vm.resetPoll = resetPoll;
    vm.resultViewTemplate = resultViewTemplate;
    vm.resume = resume;
    vm.showClose = false;
    vm.toast = null;
    vm.viewSettings = {
      highlightCorrectAnswers: false
    };
    vm.toggleHighlightCorrectAnswers = toggleHighlightCorrectAnswers;
    vm.toggleActive = toggleActive;
    vm.viewResult = viewResult;
    
    var closeState = null
      , closeStateParams = null;
    
    activate();
    
    function activate() {
      _storeCloseState();    
      auth.isAuthenticated().then(function(user) {
        var resultId = $stateParams.resultId;
        resultService.subscribe(resultId)
          .then(function(result) {
            $log.debug('result = ', result);
            vm.poll = result.poll;
            vm.result = result;
            vm.isOwner = _.contains(result.pollCollection.owners, user._id);
            vm.archiveMode = $stateParams.mode === 'archive';
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
      $state.go(closeState, closeStateParams);
    }
    
    function deactivate(result) {
      if (!result.active)
        return;
      resultService.deactivate(result._id).then(function() {
        result.active = false;
      });
    }
    
    function discardResult() {
      var confirm = $mdDialog.confirm()
        .title('Discard result')
        .htmlContent('No responses were received. This result will be discarded.')
        .ok('Okay')
        .cancel('Cancel');
      return $mdDialog.show(confirm)
        .then(function() {
          vm.result.discarded = new Date();
          return resultService.update(vm.result, 'discarded');
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
    
    function resetPoll() {
      var promise = (vm.result.responses.length === 0)
        ? discardResult()
        : saveResult();
      promise
        .then(function() {
          return resultService.createResult(vm.poll._id);
        })
        .then(viewResult);
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
    
    function saveResult() {
      if (vm.result.label)
        return $q.resolve();
      var prompt = $mdDialog.prompt()
        .title('Save result')
        .htmlContent('Enter a label for this result to help you find it in future.<br/>The date will be automatically added for you.')
        .placeholder('Label eg. Week 1 Lecture 1')
        .ariaLabel('Result label')
        .ok('Save')
        .cancel('Cancel');
      return $mdDialog.show(prompt).then(function(label) {
        vm.result.label = label;
        return resultService.update(vm.result, 'label');
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

    function toggleHighlightCorrectAnswers() {
      vm.viewSettings.highlightCorrectAnswers = !vm.viewSettings.highlightCorrectAnswers;
    }
    
    $scope.$on('$destroy', function() {
      // $log.debug('Deactivating: ', $stateParams.resultId);
      if (vm.isOwner && vm.result.active)
        resultService.deactivate(vm.result._id);
    });
    
    
    function _storeCloseState() {
      // This will be the state that the user is taken to when the result is closed
      closeState = $stateParams.closeState
        || $scope.previousState.name;
      closeStateParams = $stateParams.closeStateParams
        || $scope.previousStateParams;
    }
    
  }
  
})();