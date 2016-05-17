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

        /*
          Group responses with the same group, collection, question, choices.
          
          Output: groupedResults = {
            'identifier1': [{result}, {result}, ... ],
            'identifier2': [{result}, {result}, ... ],
            'identifier3': [{result}, {result}, ... ]
            ...
          }
        */
        var groupedResults = _.groupBy(results, function(result) {
        var identifier = result.group
         + result.pollCollection
         + result.poll.data.question
         + JSON.stringify(result.poll.data.choices);
        return identifier;
      });


      /*
        Merge the responses for each set of grouped results.
        
        Output: mergedGrouped = {
          'identifier1': {
            group: 'Week 1',
            pollText: 'Am I really just a poll question?',
            choices: [ {choice1}, {choice2} ... ],
            responses: {
              user1: { answer: 'A', time: 'Sun May 15 2016 13:43:22 GMT+1000 (AEST)' }
              ...
            }
          },
          ...
        }
      */      
      var mergedGrouped = {};      
      _.each(groupedResults, function (results, identifier) {
        if (!mergedGrouped[identifier])
          mergedGrouped[identifier] = {
            group: results[0].poll.group.name,
            pollText: results[0].poll.data.question,
            choices: results[0].poll.data.choices
          };

        if (!mergedGrouped[identifier].responses)
           mergedGrouped[identifier].responses = {};
           
        _.each(results, function (result) {
          _.each(result.responses, function (response) {
            var username = response.user.username;
            var userAnswer = response.data;
            var time =  new Date(response.time);
            if (mergedGrouped[identifier].responses[username]) {
              if (mergedGrouped[identifier].responses[username].time < time) {
                mergedGrouped[identifier].responses[username] = {
                  answer: userAnswer,
                  time: time
                };
              }
            } else {
              mergedGrouped[identifier].responses[username] = {
                answer: userAnswer,
                time: time
              };
            }
          });
        });
        
      });
          
      addGroupHeader(csv, mergedGrouped);
      addPollTextHeader(csv, mergedGrouped);
      addCorrectAnswerHeader(csv, mergedGrouped);
      createUserRows(csv, mergedGrouped);
      return $q.resolve(csv.blob());
    }
    
    function addGroupHeader(csv, results) {
      var groupsRow = _.map(results, function(result) {
        return result.group;
      });
      csv.addRow(['GROUP'].concat(groupsRow));
    }

    function addPollTextHeader(csv, results) {
      var text = _.map(results, function(result) {
        return result.pollText;
      });
      csv.addRow(['POLL TEXT'].concat(text));
    }

    function addCorrectAnswerHeader(csv, results) {
      var answers = _.map(results, function(result) {
        var correctAnswers = _.reduce(result.choices,
        function(answers, choice) {
          var answer = (choice.correct ? choice.label : '');
          return (answers + answer);
        }, '');
        return correctAnswers;
      });
      csv.addRow(['CORRECT ANSWER(S)'].concat(answers));
    }
    
    function createUserRows (csv, results) {
      // Create an index of user responses 
      var userResponses = {};
      _.each(results, function (result, identifier) {
        _.each(result.responses, function (response, username) {
          if (!userResponses[username])
            userResponses[username] = {};
          userResponses[username][identifier] = response.answer;
        });
      });
      
      // Add each student row to csv
      var usernames = _.sortBy(_.keys(userResponses),
      function (n) {return n;});
      _.each(usernames, function (username) {
        var userAnswers = _.map(results, function (result, identifier) {
          return userResponses[username][identifier] || '';
        });
        csv.addRow([username].concat(userAnswers));
      });
    }
      
  }
  
})();