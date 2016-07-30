(function() {
  'use strict';

  angular
    .module('plugins.queue')
    .controller('QueueResultViewController', QueueResultViewController);

  QueueResultViewController.$inject = [
    '$log',
    '$scope',
    'resultPluginService'
  ];

  function QueueResultViewController(
      $log,
      $scope,
      resultPluginService
    ) {
    $log = $log.getInstance('QueueResultViewController');

    /* jshint validthis: true */
    var vm = this;

    vm.choices = {};
    vm.responsesByUser = null;

    activate();

    function activate() {

    }


  }

})();
