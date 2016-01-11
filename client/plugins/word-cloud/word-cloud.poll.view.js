(function() {
  'use strict';
  
  angular
    .module('plugins.word-cloud')
    .controller('WordCloudPollViewController', WordCloudPollViewController);
      
  WordCloudPollViewController.$inject = [
    '$log', 
    '$scope', 
    'pollPluginService'
  ];
    
  function WordCloudPollViewController(
      $log, 
      $scope, 
      pollPluginService
    ) {
    $log = $log.getInstance('WordCloudPollViewController');
    
    /* jshint validthis: true */
    var vm = this;
    
    vm.clearResponse = clearResponse;
    vm.hasSubmitted = false;
    vm.response = '';
    vm.submitResponse = submitResponse;
    
    function clearResponse() {
      vm.response = '';
      vm.hasSubmitted = false;
    }
    
    function submitResponse(response) {
      vm.hasSubmitted = true;
      pollPluginService.submitResponse($scope.result._id, response);
      $log.info('Submitted response: ', response);
    }
  }
  
})();