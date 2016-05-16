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
      addGroupHeader(csv, results);
      addPollTextHeader(csv, results);
      addCorrectAnswerHeader(csv, results);
      createUserRows(csv, results);
      return $q.resolve(csv.blob());
    }
    
    function addGroupHeader(csv, results) {
      var groups = _.map(results, function(result) {
        return result.poll.group.name;
      })
      csv.addRow(['GROUP'].concat(groups))
    }

    function addPollTextHeader(csv, results) {
      var text = _.map(results, function(result) {
        return result.poll.data.question;
      })
      csv.addRow(['POLL TEXT'].concat(text))
    }
    
    function addCorrectAnswerHeader(csv, results) {
      var answers = _.map(results, function(result) {
        var correctAnswers = _.reduce(result.poll.data.choices,
        function(answers, choice) {
          var answer = (choice.correct ? choice.label : '')
          return (answers + answer)
        }, '')
        return correctAnswers;
      })
      csv.addRow(['CORRECT ANSWER(S)'].concat(answers))
    }
    
    function createUserRows (csv, results) {
      // Create an index of user responses 
      var userResponses = {}
      _.each(results, function (result) {
        _.each(result.responses, function (response) {
          var username = response.user.username
          if (!userResponses[username])
            userResponses[username] = {}
          userResponses[username][result._id] = response.data
        })
      })
    
      // Add each student row to csv
      var usernames = _.sortBy(_.keys(userResponses),
      function (n) {return n}) 
      _.each(usernames, function (username) {
        var userAnswers = _.map(results, function (result) {
          return userResponses[username][result._id] || ''
        })
        csv.addRow([username].concat(userAnswers))
      })
    }
      
  }
  
})();