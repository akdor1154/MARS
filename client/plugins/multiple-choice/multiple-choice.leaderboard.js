(function() {
'use strict';
  
  angular
    .module('plugins.multiple-choice')
    .factory('multipleChoiceLeaderboard', multipleChoiceLeaderboard);
      
  multipleChoiceLeaderboard.$inject = ['$log'];
    
  function multipleChoiceLeaderboard($log) {
    $log = $log.getInstance('multipleChoiceLeaderboard');
    
    return calculateScores; 
    
    function calculateScores(poll, responses) {
      // Find each user's final response
      var finalResponses = getFinalResponses(responses);
      
      // Filter out incorrect responses
      var correctChoices = getCorrectChoices(poll.data.choices);
      var correctResponses = getCorrectResponses(finalResponses, correctChoices);
      
      // Create scores array
      var scores = {}; 
      _.each(correctResponses, function(response) {
        scores[response.user] = 1;
      });
      return scores;
    }
    
    function getCorrectChoices(choices) {
      return _.pluck(
        _.where(choices, { correct: true }),
         'label'
      );
    }
    
    function getCorrectResponses(responses, correctChoices) {
      return _.filter(responses, function(response) {
        return _.contains(correctChoices, response.data);
      });
    }
    
    function getFinalResponses(responses) {
      return _.map(
        groupResponsesByUser(responses),
        function(responsesByUser) {
          return _.last(responsesByUser);
          }
      );
    }
    
    function groupResponsesByUser(responses) {
      return _.groupBy(responses, 'user');
    }
  }
  
})();