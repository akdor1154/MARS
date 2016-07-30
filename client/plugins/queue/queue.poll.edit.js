(function() {
  'use strict';

  angular
    .module('plugins.queue')
    .controller('QueuePollEditController', QueuePollEditController);

  QueuePollEditController.$inject = [
    '$log',
    '$scope',
    'pollPluginService'
  ];

  function QueuePollEditController($log, $scope, pollPluginService) {
    $log = $log.getInstance('QueuePollEditController');

    /* jshint validthis: true */
    var vm = this;

    vm.choiceValueChanged = choiceValueChanged;
    vm.poll = $scope.poll;
    vm.questionChanged = questionChanged;
    vm.removeChoice = removeChoice;
    vm.newChoice = newChoice;
    vm.relabelChoices = relabelChoices;


    function questionChanged(poll) {
      poll.name = poll.data.question;
      pollPluginService.updatePoll(poll);
    }

  }

})();
