(function() {
  'use strict';
  
  angular
    .module('plugins.multiple-choice')
    .factory(
      'multipleChoiceResultExportFinalResponsesCsv', 
      multipleChoiceResultExportFinalResponsesCsv
    );
      
  multipleChoiceResultExportFinalResponsesCsv.$inject = [
    '$log', 
    '$filter', 
    '$q', 
    'csvWriter'
  ];
    
  function multipleChoiceResultExportFinalResponsesCsv(
      $log, 
      $filter, 
      $q, 
      csvWriter) {
    $log = $log.getInstance('multipleChoiceResultExportFinalResponsesCsv');
    
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
        addHeaderForPoll(csv, poll);
        addResponsesForPoll(csv, responses);
        csv.newRow();
      });
      return $q.resolve(csv.blob());
    }
    
    function addHeaderForPoll(csv, poll) {
      csv
        .addRow([poll.data.question])
        .newRow();
        
      poll.data.choices.forEach(function(choice) {
        csv.addRow([
          choice.label, 
          choice.text, 
          choice.correct ? '(Correct)' : ''
        ]);
      });
      csv.newRow();
    }
    
    function addResponsesForPoll(csv, responses) {
      csv.addRow(['Username', 'Timestamp', 'Response', 'Number of Tries']);
      _.each(
        groupResponsesByUser(responses), 
        function(responses, username) {
          var response = _.last(responses);
          csv.addRow([
            username, 
            $filter('date')(response.time, 'yyyy-MM-dd HH:mm:ss'), 
            response.data,
            responses.length
          ]);
        }
      );
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