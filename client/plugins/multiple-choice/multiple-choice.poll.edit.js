(function() {
  'use strict';
  
  angular
    .module('plugins.multiple-choice')
    .controller('MultipleChoicePollEditController', MultipleChoicePollEditController);
      
  MultipleChoicePollEditController.$inject = [
    '$log', 
    '$scope', 
    'pollPluginService'
  ];
    
  function MultipleChoicePollEditController($log, $scope, pollPluginService) {
    $log = $log.getInstance('MultipleChoicePollEditController');
    
    /* jshint validthis: true */
    var vm = this;
    
    vm.choiceValueChanged = choiceValueChanged;
    vm.poll = $scope.poll;
    vm.questionChanged = questionChanged;
    vm.removeChoice = removeChoice;
    vm.newChoice = newChoice;
    vm.relabelChoices = relabelChoices;
    
    activate();
    
    function activate() {
      if (!angular.isArray(vm.poll.data.choices))
        vm.poll.data.choices = [];
      if ((vm.poll.data.choices.length > 0 
          && !vm.poll.data.choices[vm.poll.data.choices.length - 1].blank)
          || vm.poll.data.choices.length === 0)
        newChoice();
        
      pollPluginService.beforeSave($scope, vm.poll, function(poll) {
        if (angular.isArray(poll.data.choices)) {
          poll.data.choices = _.map(
            _.filter(poll.data.choices, function(choice) {
              return !choice.blank;
            }),
            function(choice) {
              return _.omit(choice, ['$$hashKey', 'blank']);
            }
          );
        }
      });
    }
    
    function choiceValueChanged(index, value) {
      if (value) {
        vm.poll.data.choices[index].blank = false;
        pollPluginService.updatePoll(vm.poll);
      }
      if (index === $scope.poll.data.choices.length - 1) {
        if (value)
          newChoice();
      }
    }
    
    function questionChanged(poll) {
      poll.name = poll.data.question;
      pollPluginService.updatePoll(poll);
    }
    
    function removeChoice(index) {
      vm.poll.data.choices.splice(index, 1);
      relabelChoices();
      pollPluginService.updatePoll(vm.poll, true);
    }
    
    function newChoice() {
      var index = vm.poll.data.choices.length;
      vm.poll.data.choices.push({
        label: String.fromCharCode(65 + index),
        type: 'multiple-choice-text-choice',
        text: '',
        blank: true
      });
    }
    
    function relabelChoices() {
      vm.poll.data.choices.forEach(function(choice, index) {
        choice.label = String.fromCharCode(65 + index);
      });
    }
    
  }
  
})();