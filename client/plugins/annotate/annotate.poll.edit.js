(function() {
  'use strict';

  angular
    .module('plugins.annotate')
    .controller('AnnotatePollEditController', AnnotatePollEditController);

  AnnotatePollEditController.$inject = [
    '$log',
    '$scope',
    'pollPluginService'
  ];

  function AnnotatePollEditController($log, $scope, pollPluginService) {
    $log = $log.getInstance('AnnotatePollEditController');

    /* jshint validthis: true */
    var vm = this;

    vm.poll = $scope.poll;
    vm.questionChanged = questionChanged;
    

    function questionChanged(poll) {
      poll.name = poll.data.question;
      pollPluginService.updatePoll(poll);
    }

  }

})();
