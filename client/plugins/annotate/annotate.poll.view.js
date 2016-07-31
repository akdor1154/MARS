(function() {
  'use strict';

  angular
    .module('plugins.annotate')
    .controller('AnnotatePollViewController', AnnotatePollViewController);

  AnnotatePollViewController.$inject = [
    '$log',
    '$scope',
    'pollPluginService'
  ];

  function AnnotatePollViewController($log, $scope, pollPluginService) {
    $log = $log.getInstance('AnnotatePollViewController');

    /* jshint validthis: true */
    var vm = this;

    vm.printDebug = printDebug;

    function printDebug() {
      console.log($scope.savedDraws);
    }
  }
})();
