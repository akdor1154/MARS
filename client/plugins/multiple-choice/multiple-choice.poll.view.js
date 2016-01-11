(function() {
  'use strict';
  
  angular
    .module('plugins.multiple-choice')
    .controller('MultipleChoicePollViewController', MultipleChoicePollViewController);
      
  MultipleChoicePollViewController.$inject = [
    '$log', 
    '$scope', 
    'pollPluginService'
  ];
    
  function MultipleChoicePollViewController(
      $log, 
      $scope, 
      pollPluginService
    ) {
    $log = $log.getInstance('MultipleChoicePollViewController');
    
    /* jshint validthis: true */
    var vm = this;
    
    vm.selectedChoice = null;
    vm.submitResponse = submitResponse;
    
    function submitResponse(choice) {
      // No point submitting the same choice twice
      if (choice === vm.selectedChoice)
          return;
      vm.selectedChoice = choice;
      pollPluginService.submitResponse($scope.result._id, choice.label);
      $log.info('Submitted response: ', choice.label);
    }
  }
  
})();