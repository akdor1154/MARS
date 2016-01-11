(function() {
  'use strict';
  
  angular
    .module('app.data')
    .factory('csvWriter', csvWriter);
      
  csvWriter.$inject = ['$log', 'Blob'];
    
  function csvWriter($log, Blob) {
    $log = $log.getInstance('csvWriter');
    
    return function() {
      
      var currentRow = '';
      var rows = [];
      
      var self = {
        addField: addField,
        addRow: addRow,
        blob: blob,
        newRow: newRow,
        rows: rows
      };
      return self;
      
      function addField(field) {
        currentRow += _escapeField(field) + ',';
        return self;
      }
      
      function addRow(fields) {
        currentRow = '';
        fields.forEach(function(field) {
          addField(field);
        });
        newRow();
        return self;
      }
      
      function blob() {
        return new Blob(rows, { type: 'text/csv;charset=utf-8' });
      }
      
      function newRow() {
        rows.push(currentRow + '\n');
        currentRow = '';
        return self;
      }
      
      function _escapeField(field) {
        return angular.isString(field)
          ? '"' + field.replace('"', '""') + '"'
          : '"' + field + '"';
      }
      
    }
  }
  
})();