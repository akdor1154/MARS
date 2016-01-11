(function() {
  'use strict';
  
  angular
    .module('plugins.word-cloud')
    .factory(
      'wordCloudResultExportAllResponsesCsv', 
      wordCloudResultExportAllResponsesCsv
    );
      
  wordCloudResultExportAllResponsesCsv.$inject = [
    '$log', 
    '$filter', 
    '$q', 
    'csvWriter'
  ];
    
  function wordCloudResultExportAllResponsesCsv(
      $log, 
      $filter, 
      $q, 
      csvWriter) {
    $log = $log.getInstance('wordCloudResultExportAllResponsesCsv');
    
    return function(result) {
      $log.debug('csv = ', csvWriter);
      var csv = csvWriter();
      
      // Poll question
      csv
        .addRow([result.poll.data.question])
        .newRow();
      
      // User responses
      csv.addRow(['Username', 'Timestamp', 'Response']);
      result.responses.forEach(function(response) {
        csv.addRow([
          response.user.username, 
          $filter('date')(response.time, 'yyyy-MM-dd HH:mm:ss'), 
          response.data
        ]);
      });
      
      return $q.resolve(csv.blob());
    }
  }
  
})();