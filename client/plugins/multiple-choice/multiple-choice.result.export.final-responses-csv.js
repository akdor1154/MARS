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
    
    return function(result) {
      var csv = csvWriter();
      
      // Poll question
      csv
        .addRow([result.poll.data.question])
        .newRow();
        
      // Poll choices
      result.poll.data.choices.forEach(function(choice) {
        csv.addRow([choice.label, choice.text]);
      });
      csv.newRow();
      
      // User responses
      csv.addRow(['Username', 'Timestamp', 'Response', 'Number of Tries']);
      _.each(
        groupResponsesByUser(result.responses), 
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
      
      return $q.resolve(csv.blob());
    }
    
    function groupResponsesByUser(responses) {
      return _.groupBy(responses, function(response) {
        return response.user.username;
      });
    }
  }
  
})();