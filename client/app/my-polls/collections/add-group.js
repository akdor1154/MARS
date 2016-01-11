(function() {
  'use strict';
  
  angular
    .module('app.myPolls')
    .controller('AddGroupController', AddGroupController);
      
  AddGroupController.$inject = [
    '$log', 
    '$mdDialog', 
    'inflector',
    'plugins',
    'myPollsService', 
    'collection'];
    
  function AddGroupController($log, $mdDialog, inflector, plugins, myPollsService, collection) {
    $log = $log.getInstance('AddGroupController');
    
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
      name: '',
      pollCollection: collection,
      color: collection.groups.length > 0 
          ? _.last(collection.groups).color
          : _.first(vm.colors),
      polls: [],
      upcoming: new Date()
    };
    vm.inflector = inflector;
    vm.isSaving = false;
    vm.save = save;
    
    
    function save() {
      vm.action = 'Saving';
      myPollsService.createGroup(vm.group).then(function(group) {
        vm.action = null;
        group._scrollTo = true;
        $mdDialog.hide();
      });
    }
    
    function cancel() {
      $mdDialog.cancel();
    }
  }
  
})();