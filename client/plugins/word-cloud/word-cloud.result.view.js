(function() {
  'use strict';
  
  angular
    .module('plugins.word-cloud')
    .controller('WordCloudResultViewController', WordCloudResultViewController);
  
  WordCloudResultViewController.$inject = [
    '$log', 
    '$scope',
    'resultPluginService'
  ];
    
  function WordCloudResultViewController(
      $log, 
      $scope,
      resultPluginService
    ) {
    $log = $log.getInstance('WordCloudResultViewController');
    
    /* jshint validthis: true */
    var vm = this;
    
    vm.poll = null;
    vm.responsesByUser = null;
    vm.result = null;
    vm.words = {};
    vm.wordsUpdated = false;
    
    activate();
    
    function activate() {
      var poll = vm.poll = $scope.poll
        , result = vm.result = $scope.result;
      
      if (!angular.isObject(result.data))
        result.data = {}; 
      
      if (!result.data.hasOwnProperty('word-cloud')) {
        result.data['word-cloud'] = [];
      }
      
      // Calculate aggregates for existing responses
      // vm.responsesByUser = _.groupBy(result.responses, 'user');
      // _.each(vm.responsesByUser, function(userResponses) {
        // var lastResponse = _.last(userResponses).data;
        // _addWord(lastResponse);
      // });
      _.each(result.responses, function(response) {
        _addWord(response.data);
      });
      
      resultPluginService.onResponseReceived($scope, result._id, _onResponseReceived);
    }
    
    function _onResponseReceived(response) {
      $log.debug('response = ', response);
      // if (_.has(vm.responsesByUser, response.user)) {
        // var lastResponse = _.last(vm.responsesByUser[response.user]).data;
        // _removeWord(lastResponse);
      // }
      // else {
        // vm.responsesByUser[response.user] = [];
      // }
      // vm.responsesByUser[response.user].push(response);
      _addWord(response.data);
    }
    
    function _addWord(word) {
      if (angular.isObject(vm.words[word]))
        vm.words[word].value++;
      else {
        vm.words[word] = { text: word, value: 1 };
        vm.result.data['word-cloud'] = _.values(vm.words);
      }
      vm.wordsUpdated = true;
    }
    
    function _removeWord(word) {
      if (!angular.isObject(vm.words[word]))
        return;
      if (vm.words[word].value > 1)
        vm.words[word].value--;
      else {
        delete vm.words[word];
        vm.result.data['word-cloud'] = _.values(vm.words);
      }
    }
    
  }
  
})();