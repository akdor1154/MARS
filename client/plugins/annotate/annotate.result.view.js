(function() {
  'use strict';

  angular
    .module('plugins.annotate')
    .controller('AnnotateResultViewController', AnnotateResultViewController);

  MultipleChoiceResultViewController.$inject = [
    '$log',
    '$scope',
    'resultPluginService'
  ];

  function AnnotateResultViewController(
      $log,
      $scope,
      resultPluginService
    ) {
    $log = $log.getInstance('AnnotateResultViewController');

    /* jshint validthis: true */
    var vm = this;

    vm.choices = {};
    vm.responsesByUser = null;

    activate();

    function activate() {

    }


  }

})();
