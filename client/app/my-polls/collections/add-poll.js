(function() {
  'use strict';
  
  angular
    .module('app.myPolls')
    .controller('AddPollController', AddPollController);
      
  AddPollController.$inject = [
    '$log',
    '$mdDialog',
    'inflector',
    'plugins',
    'PLUGIN',
    'myPollsService',
    'group'
  ];
    
  function AddPollController(
      $log, 
      $mdDialog, 
      inflector, 
      plugins, 
      PLUGIN, 
      myPollsService,
      group
    ) {
    $log = $log.getInstance('AddPollController');
    
    /* jshint validthis: true */
    var vm = this;
    
    vm.action = null;
    vm.group = group;
    vm.inflector = inflector;
    vm.pollTypes = plugins.registered(PLUGIN.POLL_TYPE);
    vm.poll = {
      name: 'New Poll',
      group: group,
      pollCollection: group.pollCollection,
      type: vm.pollTypes[0].name,
      data: {}
    };
    vm.serverErrors = {};
    
    vm.create = function() {
      vm.action = 'Saving';
      myPollsService.createPoll(vm.poll)
        .then(function(poll) {
          vm.action = null;
          $mdDialog.hide('create');
        })
        .catch(function(err) {
          vm.serverErrors[err.code] = true;
          vm.action = null;
        });
    }
    
    vm.cancel = function() {
      $mdDialog.cancel();
    }
    
  }
  
})();