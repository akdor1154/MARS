(function() {
  'use strict';
  
  angular
    .module('plugins.multiple-choice')
    .factory(
      'multipleChoiceResultExportMarkingCsv', 
      multipleChoiceResultExportMarkingCsv
    );
      
  multipleChoiceResultExportMarkingCsv.$inject = [
    '$log', 
    '$filter', 
    '$q', 
    'csvWriter'
  ];
    
  function multipleChoiceResultExportMarkingCsv(
      $log, 
      $filter,
      $q, 
      csvWriter) {
    $log = $log.getInstance('multipleChoiceResultExportMarkingCsv');
    
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
      var pollIds = [];
      var groupRow = ['GROUP'];
      var pollTextRow = ['POLL TEXT'];
      var correctAnswersRow = ['CORRECT ANSWERS'];
      var finalResponsesByUser = {};
      
      _.each(resultsByPoll, function(pollResults, pollId) {
        var group = _.first(pollResults).group;
        var poll = _.first(pollResults).poll;
        var responses = _.flatten(_.pluck(pollResults, 'responses'));
        var responsesByUser = groupResponsesByUser(responses);
        pollIds.push(pollId);
        groupRow.push(group.name);
        pollTextRow.push(poll.data.question);
        correctAnswersRow.push(getCorrectAnswersString(poll));
        _.each(responsesByUser, function(userResponses, userId) {
          var finalResponse = _.last(userResponses);
          finalResponsesByUser[userId] = finalResponsesByUser[userId] || {};
          finalResponsesByUser[userId][pollId] = finalResponse;
          finalResponsesByUser[userId].$username = finalResponse.user.username;
        });
      });
      
      finalResponsesByUser = _.sortBy(finalResponsesByUser, '$username');
      
      csv.addRow(groupRow);
      csv.addRow(pollTextRow);
      csv.addRow(correctAnswersRow);
      
      _.each(finalResponsesByUser, function(userResponses) {
        var row = [userResponses.$username];
        _.each(pollIds, function(pollId) {
          var response = userResponses[pollId]; 
          row.push(response ? response.data : '');
        });
        csv.addRow(row);
      });
      
      return $q.resolve(csv.blob());
    }
    
    function getCorrectAnswersString(poll) {
      return _.map(
        _.where(poll.data.choices, { correct: true }),
        function(choice) {
          return choice.label;
        }
      ).join('');
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