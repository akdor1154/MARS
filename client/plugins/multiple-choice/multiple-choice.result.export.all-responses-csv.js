(function() {
  'use strict';
  
  angular
    .module('plugins.multiple-choice')
    .factory(
      'multipleChoiceResultExportAllResponsesCsv', 
      multipleChoiceResultExportAllResponsesCsv
    );
      
  multipleChoiceResultExportAllResponsesCsv.$inject = [
    '$log', 
    '$filter', 
    '$q', 
    'csvWriter'
  ];
    
  function multipleChoiceResultExportAllResponsesCsv(
      $log, 
      $filter, 
      $q, 
      csvWriter) {
    $log = $log.getInstance('multipleChoiceResultExportAllResponsesCsv');
    
    return function(result) {
      $log.debug('csv = ', csvWriter);
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