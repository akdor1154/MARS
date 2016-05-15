(function() {
  'use strict';
  
  angular
    .module('plugins.multiple-choice')
    .factory(
      'multipleChoiceResultExportAnswerBreakdown', 
      multipleChoiceResultExportAnswerBreakdown
    );
      
  multipleChoiceResultExportAnswerBreakdown.$inject = [
    '$log', 
    '$filter', 
    '$q', 
    'csvWriter'
  ];
    
  function multipleChoiceResultExportAnswerBreakdown(
      $log, 
      $filter, 
      $q, 
      csvWriter) {
    $log = $log.getInstance('multipleChoiceResultExportAnswerBreakdown');
    
    return {
      canExportResult: canExportResult,
      exportResults: exportResults
    };
    
    function canExportResult(result) {
      return result.type === 'multiple-choice';
    }
    
    function exportResults(results) {
      var csv = csvWriter();
      var resultsByPoll = groupResultsByPoll(results);
      _.each(resultsByPoll, function(pollResults, pollId) {
        var poll = _.first(pollResults).poll;
        var responses = _.flatten(_.pluck(pollResults, 'responses'));
        addRowsForPoll(csv, poll, responses);
        csv.newRow();
      });
      return $q.resolve(csv.blob());
    }
    
    function addRowsForPoll(csv, poll, responses) {
      var finalResponses = getFinalResponses(responses);
      var responsesByChoice = groupResponsesByChoice(finalResponses);
      var totalResponses = finalResponses.length;
        
      csv
        .addRow([poll.data.question])
        .addRow(['Total responses: ', totalResponses])
        .newRow();
        
      poll.data.choices.forEach(function(choice) {
        csv.addRow([
          choice.label, 
          choice.text, 
          (responsesByChoice[choice.label].length / totalResponses).toString(),
          choice.correct ? '(Correct)' : ''
        ]);
      });
      csv.newRow();
    }
    
    function getFinalResponses(responses) {
      return _.map(
        groupResponsesByUser(responses),
        function(responsesByUser) {
          return _.last(responsesByUser);
        }
      );
    }
    
    function groupResponsesByChoice(finalResponses) {
      return _.groupBy(finalResponses, 'data');
    }
    
    function groupResponsesByUser(responses) {
      return _.groupBy(responses, function(response) {
        return response.user.username;
      });
    }
    
    function groupResultsByPoll(results) {
      return _.groupBy(results, function(result) {
        return result.poll._id;
      });
    }
  }
  
})();