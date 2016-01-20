(function() {
  'use strict';
  
  angular
    .module('app.myPolls')
    .controller('GettingStartedController', GettingStartedController);
      
  GettingStartedController.$inject = ['$log', '$scope', 'shell'];
    
  function GettingStartedController($log, $scope, shell) {
    $log = $log.getInstance('GettingStartedController');
    
    /* jshint validthis: true */
    var vm = this;
    vm.close = close;
    
    activate();
    
    function activate() {
      shell.title = 'Welcome to MARS'
    }
    
    function close() {
      $scope.goToPreviousState();
    }
    
  }
  
})();