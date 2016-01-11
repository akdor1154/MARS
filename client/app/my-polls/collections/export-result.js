(function() {
  'use strict';
  
  angular
    .module('app.myPolls')
    .controller('ExportResultController', ExportResultController);
      
  ExportResultController.$inject = [
    '$log',
    '$filter',
    '$injector',
    '$mdDialog',
    'FileSaver',
    'inflector',
    'plugins',
    'PLUGIN',
    'myPollsService',
    'group'
  ];
    
  function ExportResultController(
      $log, 
      $filter,
      $injector,
      $mdDialog, 
      FileSaver,
      inflector, 
      plugins, 
      PLUGIN, 
      myPollsService,
      group
    ) {
    $log = $log.getInstance('ExportResultController');
    
    /* jshint validthis: true */
    var vm = this;
    
    vm.action = null;
    vm.cancel = cancel;
    vm.export = doExport;
    vm.exporters = null;
    vm.group = group;
    vm.inflector = inflector;
    vm.polls = group.polls;
    vm.results = null;
    vm.resultDateFormat = 'EEEE, dd MMMM yyyy, hh:mma';
    vm.selectedExporter = null;
    vm.selectedExporterChanged = selectedExporterChanged;
    vm.selectedPoll = null;
    vm.selectedPollChanged = selectedPollChanged;
    vm.selectedResult = null;
    vm.selectedResultChanged = selectedResultChanged;
    
    function cancel() {
      $mdDialog.cancel();
    }
    
    function doExport() {
      vm.action = 'Preparing';
      var exportFn = $injector.get(vm.selectedExporter.factory);
      myPollsService.getResult(vm.selectedResult._id)
        .then(exportFn)
        .then(function(data) {
          vm.action = 'Downloading';
          var fileName = 'MARS Result ' 
            + $filter('date')(
                vm.selectedResult.lastActivation.start, 
                'yyyy-MM-dd HH.mm'
              )
            + ' ' + vm.selectedExporter.name
            + vm.selectedExporter.extension;
          FileSaver.saveAs(data, fileName);
          $log.info('Exported result ' + vm.selectedResult._id + ' to file "' + fileName + '"');
          vm.action = null;
          $mdDialog.hide();
        });
    }
    
    function selectedExporterChanged() {
      $log.debug('Selected exporter: ', vm.selectedExporter);
    }
    
    function selectedPollChanged() {
      $log.debug('Selected poll: ', vm.selectedPoll);
      vm.action = 'Loading Results';
      vm.results = vm.selectedResult = null;
      vm.exporters = vm.selectedExporter = null;
      myPollsService.getResults(vm.selectedPoll._id)
        .then(function(results) {
          results.forEach(function(result) {
            result.lastActivation = _.last(result.activations);
          });
          vm.results = results;
          vm.action = null;
        }
      );
    }
    
    function selectedResultChanged() {
      $log.debug('Selected result: ', vm.selectedResult);
      vm.exporters = _.flatten(_.pluck(
        _.where(
          plugins.registered(PLUGIN.RESULT_EXPORTERS),
          { name: vm.selectedResult.type }
        ),
        'options'
      ));
      vm.selectedExporter = _.first(vm.exporters);
    }
    
  }
  
})();