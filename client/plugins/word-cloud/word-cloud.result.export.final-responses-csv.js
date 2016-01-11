(function() {
  'use strict';
  
  angular
    .module('plugins.word-cloud')
    .factory(
      'wordCloudResultExportFinalResponsesCsv', 
      wordCloudResultExportFinalResponsesCsv
    );
      
  wordCloudResultExportFinalResponsesCsv.$inject = [
    '$log', 
    '$filter', 
    '$q', 
    'csvWriter'
  ];
    
  function wordCloudResultExportFinalResponsesCsv(
      $log, 
      $filter, 
      $q, 
      csvWriter) {
    $log = $log.getInstance('wordCloudResultExportFinalResponsesCsv');
    
    return function(result) {
      var csv = csvWriter();
      
      // Poll question
      csv
        .addRow([result.poll.data.question])
        .newRow();
      
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