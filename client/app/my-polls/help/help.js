(function() {
  'use strict';
  
  angular
    .module('app.myPolls')
    .controller('HelpController', HelpController);
      
  HelpController.$inject = ['$log', '$scope', 'shell'];
    
  function HelpController($log, $scope, shell) {
    $log = $log.getInstance('HelpController');
    
    /* jshint validthis: true */
    var vm = this;
    
    activate();
    
    function activate() {
      shell.title = 'Help and Support'
    }
    
  }
  
})();