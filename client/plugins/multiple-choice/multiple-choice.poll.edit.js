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
        
      // Support copying to clipboard
      vm.poll.toPlainText = toPlainText;
        
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
    
    function choiceValueChanged(index, choice) {
      if (choice.text || angular.isDefined(choice.correct)) {
        choice.blank = false;
        pollPluginService.updatePoll(vm.poll);
      }
      if (index === vm.poll.data.choices.length - 1) {
        if (choice.text)
          newChoice();
      }
    }
    
    function newChoice() {
      var index = vm.poll.data.choices.length;
      vm.poll.data.choices.push({
        label: String.fromCharCode(65 + index),
        type: 'multiple-choice-text-choice',
        text: '',
        correct: false,
        blank: true
      });
    }
    
    function questionChanged(poll) {
      poll.name = poll.data.question;
      pollPluginService.updatePoll(poll);
    }
    
    function relabelChoices() {
      vm.poll.data.choices.forEach(function(choice, index) {
        choice.label = String.fromCharCode(65 + index);
      });
    }
    
    function removeChoice(index) {
      vm.poll.data.choices.splice(index, 1);
      relabelChoices();
      pollPluginService.updatePoll(vm.poll, true);
    }
    
    function toPlainText() {
      var text = vm.poll.data.question + '\n\n';
      vm.poll.data.choices.forEach(function(choice) {
        if (choice.blank)
          return;
        text += choice.label + ') ' + choice.text + '\n';
      });
      return text;
    }
    
  }
  
})();