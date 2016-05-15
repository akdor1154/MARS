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
    '$timeout',
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
      $timeout,
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
    vm.areAllSelected = areAllSelected;
    vm.cancel = cancel;
    vm.doExport = doExport;
    vm.exporters = null;
    vm.group = group;
    vm.inflector = inflector;
    vm.isSelectAllDisabled = isSelectAllDisabled;
    vm.loadPromise = null;
    vm.polls = _.indexBy(group.polls, '_id');
    vm.results = null;
    vm.resultDateFormat = 'EEEE, dd MMMM yyyy, hh:mma';
    vm.selectedExporter = null;
    vm.selectedExporterChanged = selectedExporterChanged;
    // vm.selectedPollChanged = selectedPollChanged;
    vm.selectedResults = {};
    vm.subscribers = {};
    vm.toggleSelectAll = toggleSelectAll;
    // vm.selectedResultChanged = selectedResultChanged;
    
    activate();
    
    function activate() {
      vm.exporters = plugins.registered(PLUGIN.RESULT_EXPORTERS);
      vm.loadPromise = loadResults()
        .then(loadSubscribers);
    }
    
    function areAllSelected(pollId) {
      return !_.some(vm.results[pollId], function(result) {
        return !vm.selectedResults[result._id];
      });
    }
    
    function cancel() {
      $mdDialog.cancel();
    }
    
    function doExport() {
      if (!vm.selectedExporter)
        return;
      vm.action = 'Preparing';
      var results = getSelectedResults();
      mapSubscribersToResponses(results);
      vm.selectedExporter.exportResults(results)
        .then(function(exportedResults) {
          vm.action = 'Downloading';
          var fileName = 'MARS Result - ' 
            + vm.group.name
            + ' - '
            + vm.selectedExporter.name
            + ' ('
            +  $filter('date')(
                new Date(), 
                'yyyy-MM-dd HH.mm'
              )
            + ')'
            + vm.selectedExporter.extension;
          FileSaver.saveAs(exportedResults, fileName);
          $log.info('Exported results to file "' + fileName + '"');
          vm.action = null;
          $mdDialog.hide();
        });
    }
    
    function getSelectedResults() {
      return _.filter(
        _.flatten(_.values(vm.results)),
        function(result) {
          return vm.selectedResults[result._id];
        }
      );
    }
    
    function isSelectAllDisabled(pollId) {
      return _.every(vm.results[pollId], function(result) {
        return result.disabled;
      });
    }
    
    function loadResults() {
      vm.action = "Loading results";
      return myPollsService.getResults(
        _.pluck(vm.group.polls, '_id')
      ).then(function(results) {
        results = _.filter(results, function(result) {
          return result.responses.length > 0;
        });
        _.each(results, function(result) {
          result.disabled = !(vm.selectedExporter
            && vm.selectedExporter.canExportResult(result));
          result.lastActivation = _.last(result.activations);
          result.poll = vm.polls[result.poll];
        });
        vm.results = _.groupBy(results, function(result) {
          return result.poll._id;
        });
        vm.action = null;
      });
    }
    
    function loadSubscribers() {
      vm.action = "Loading subscribers";
      return myPollsService.listSubscribers(vm.group.collection._id)
        .then(function(subscribers) {
          vm.subscribers = _.indexBy(subscribers, '_id');
          vm.action = null;
        });
    }
    
    function mapSubscribersToResponses(results) {
      _.each(results, function(result) {
        _.each(result.responses, function(response) {
          if (_.isString(response.user))
            response.user = vm.subscribers[response.user];
        });
      });
    }
    
    function selectedExporterChanged() {
      var pluginExporter = $injector.get(vm.selectedExporter.factory);
      _.extend(vm.selectedExporter, pluginExporter);
      updateEnabledResults();
    }
    
    function toggleSelectAll(pollId) {
      if (isSelectAllDisabled(pollId))
        return;
      var selectAll = !areAllSelected(pollId);
      _.each(vm.results[pollId], function(result) {
        vm.selectedResults[result._id] = selectAll;
      });
    }
    
    function updateEnabledResults() {
      _.each(vm.results, function(pollResults) {
        _.each(pollResults, function(result) {
          result.disabled = !(vm.selectedExporter
            && vm.selectedExporter.canExportResult(result));
        });
      });
    }
    
    // function selectedPollChanged() {
    //   $log.debug('Selected poll: ', vm.selectedPoll);
    //   vm.action = 'Loading Results';
    //   vm.results = vm.selectedResult = null;
    //   vm.exporters = vm.selectedExporter = null;
    //   myPollsService.listResults(vm.selectedPoll._id)
    //     .then(function(results) {
    //       results.forEach(function(result) {
    //         result.lastActivation = _.last(result.activations);
    //       });
    //       vm.results = results;
    //       vm.action = null;
    //     }
    //   );
    // }
    
    // function selectedResultChanged() {
    //   $log.debug('Selected result: ', vm.selectedResult);
    //   vm.exporters = _.flatten(_.pluck(
    //     _.where(
    //       plugins.registered(PLUGIN.RESULT_EXPORTERS),
    //       { name: vm.selectedResult.type }
    //     ),
    //     'options'
    //   ));
    //   vm.selectedExporter = _.first(vm.exporters);
    // }
    
  }
  
})();