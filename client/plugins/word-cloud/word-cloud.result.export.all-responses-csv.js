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
    
    return {
      canExportResult: canExportResult,
      exportResults: exportResults
    };
    
    function canExportResult(result) {
      return result.type === 'word-cloud';
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
    }
    
    function addResponsesForPoll(csv, responses) {
      csv.addRow(['Username', 'Timestamp', 'Response']);
      responses.forEach(function(response) {
        csv.addRow([
          response.user.username, 
          $filter('date')(response.time, 'yyyy-MM-dd HH:mm:ss'), 
          response.data
        ]);
      });
    }
    
    function groupResultsByPoll(results) {
      return _.groupBy(results, function(result) {
        return result.poll._id;
      });
    }
  }
  
})();