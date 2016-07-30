(function() {
  'use strict';

  angular
    .module('plugins.queue')
    .controller('QueuePollViewController', QueuePollViewController);

  QueuePollViewController.$inject = [
    '$log',
    '$scope',
    'pollPluginService'
  ];

  function QueuePollViewController(
      $log,
      $scope,
      pollPluginService
    ) {
    $log = $log.getInstance('QueuePollViewController');

    /* jshint validthis: true */
    var vm = this;


})();
