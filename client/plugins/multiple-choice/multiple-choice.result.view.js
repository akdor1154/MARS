(function() {
  'use strict';
  
  angular
    .module('plugins.multiple-choice')
    .controller('MultipleChoiceResultViewController', MultipleChoiceResultViewController);
  
  MultipleChoiceResultViewController.$inject = [
    '$log', 
    '$scope',
    'resultPluginService'
  ];
    
  function MultipleChoiceResultViewController(
      $log, 
      $scope,
      resultPluginService
    ) {
    $log = $log.getInstance('MultipleChoiceResultViewController');
    
    /* jshint validthis: true */
    var vm = this;
    
    vm.choices = {};
    vm.responsesByUser = null;
    
    activate();
    
    function activate() {
      var poll = $scope.poll
        , result = $scope.result;
      
      if (!angular.isObject(result.data))
        result.data = {}; 
      
      if (!result.data.hasOwnProperty('multiple-choice')) {
        result.data['multiple-choice'] = _.map(
          poll.data.choices, 
          function(choice) {
            return {
              label: choice.label,
              text: choice.text,
              correct: choice.correct,
              value: 0
            }
          }
        );
      }
      
      // Build a hashtable to make finding choices by label faster
      result.data['multiple-choice'].forEach(function(choice) {
        vm.choices[choice.label] = choice;
      });
      
      // Calculate aggregates for existing responses
      vm.responsesByUser = _.groupBy(result.responses, 'user');
      _.each(vm.responsesByUser, function(userResponses) {
        vm.choices[_.last(userResponses).data].value++;
      });
      
      resultPluginService.onResponseReceived($scope, result._id, _onResponseReceived);
    }
    
    function _onResponseReceived(response) {
      if (_.has(vm.responsesByUser, response.user)) {
        var lastResponseByUser = _.last(vm.responsesByUser[response.user]);
        vm.choices[lastResponseByUser.data].value--;
      }
      else {
        vm.responsesByUser[response.user] = [];
      }
      vm.responsesByUser[response.user].push(response);
      if (_.has(vm.choices, response.data)) {
        vm.choices[response.data].value++;
      }
    }
    
  }
  
})();