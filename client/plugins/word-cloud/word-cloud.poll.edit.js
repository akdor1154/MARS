(function() {
  'use strict';
  
  angular
    .module('plugins.multiple-choice')
    .controller('WordCloudPollEditController', WordCloudPollEditController);
      
  WordCloudPollEditController.$inject = [
    '$log', 
    '$scope', 
    'pollPluginService'
  ];
    
  function WordCloudPollEditController($log, $scope, pollPluginService) {
    $log = $log.getInstance('WordCloudPollEditController');
    
    /* jshint validthis: true */
    var vm = this;
    
    vm.poll = $scope.poll;
    vm.questionChanged = questionChanged;
    
    activate();
    
    function activate() {
      // Nothing to do so far...
    }
    
    function questionChanged(poll) {
      poll.name = poll.data.question;
      pollPluginService.updatePoll(poll);
    }

  }
  
})();