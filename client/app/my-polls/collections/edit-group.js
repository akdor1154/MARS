(function() {
  'use strict';
  
  angular
    .module('app.myPolls')
    .controller('EditGroupController', EditGroupController);
      
  EditGroupController.$inject = [
    '$log', 
    '$mdDialog', 
    'inflector',
    'plugins',
    'myPollsService', 
    'group'
	];
    
  function EditGroupController(
      $log, 
      $mdDialog, 
      inflector, 
      plugins, 
      myPollsService, 
      group
    ) {
    $log = $log.getInstance('EditGroupController');
    
    /* jshint validthis: true */
    var vm = this;
    
    vm.action = null;
    vm.cancel = cancel;
    vm.colors = [
      'red',
      'pink',
      'purple',
      'deep-purple',
      'indigo',
      'blue',
      'light-blue',
      'cyan',
      'teal',
      'green',
      'lime-green',
      'lime',
      'yellow',
      'amber',
      'orange',
      'deep-orange',
      'brown',
      'blue-grey'
    ];
    vm.group = {
      _id: group._id,
      name: group.name,
      color: group.color
    };
    vm.inflector = inflector;
    vm.save = save;
    vm.serverErrors = {};
    
    
    function save() {
      vm.action = 'Saving';
      myPollsService.updateGroup(vm.group)
        .then(function() {
          group.name = vm.group.name;
          group.color = vm.group.color;
          vm.action = null;
          $mdDialog.hide(group);
        })
        .catch(function(err) {
          vm.serverErrors[err.code] = true;
          vm.action = null;
        });
    }
    
    function cancel() {
      $mdDialog.cancel();
    }
  }
  
})();