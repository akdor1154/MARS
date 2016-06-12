(function() {
  'use strict';
  
  angular
    .module('app.myPolls')
    .controller('ExportResultsController', ExportResultsController);
      
  ExportResultsController.$inject = [
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
    'groups'
  ];
    
  function ExportResultsController(
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
      groups
    ) {
    $log = $log.getInstance('ExportResultsController');
    
    /* jshint validthis: true */
    var vm = this;
    
    vm.action = null;
    vm.areAllSelected = areAllSelected;
    vm.areAllSelectedForPoll = areAllSelectedForPoll;
    vm.cancel = cancel;
    vm.doExport = doExport;
    vm.exporters = null;
    vm.groups = groups;
    vm.inflector = inflector;
    vm.isSelectAllDisabled = isSelectAllDisabled;
    vm.isSelectAllDisabledForPoll = isSelectAllDisabledForPoll;
    vm.loadPromise = null;
    vm.results = null;
    vm.resultDateFormat = 'EEEE, dd MMMM yyyy, hh:mma';
    vm.selectedExporter = null;
    vm.selectedExporterChanged = selectedExporterChanged;
    vm.selectedResults = {};
    vm.subscribers = {};
    vm.toggleSelectAll = toggleSelectAll;
    vm.toggleSelectAllForPoll = toggleSelectAllForPoll;
    
    activate();
    
    function activate() {
      vm.exporters = plugins.registered(PLUGIN.RESULT_EXPORTERS);
      vm.loadPromise = loadResults();
    }
    
    function areAllSelected() {
      return vm.results
        && !_.some(_.keys(vm.results), function(pollId) {
          return !areAllSelectedForPoll(pollId);
        });
    }
    
    function areAllSelectedForPoll(pollId) {
      return vm.results 
        && vm.results[pollId]
        && !_.some(vm.results[pollId], function(result) {
          return !vm.selectedResults[result._id];
        });
    }
    
    function cancel() {
      $mdDialog.cancel();
    }
    
    function canExportResult(exporter, result) {
      return exporter && exporter.canExportResult(result);
    }
    
    function doExport() {
      if (!vm.selectedExporter)
        return;
      var exporter = vm.selectedExporter;
      var resultIds = getSelectedResultIds();
      var subscribersById = [];
      vm.action = 'Loading responses';
      return myPollsService.getResults(resultIds)
        .then(function(results) {
          vm.action = 'Preparing';
          return exporter.exportResults(results);
        })
        .then(function(exportedResults) {
          vm.action = 'Downloading';
          var fileName = generateFileName(vm.groups, vm.selectedExporter);
          FileSaver.saveAs(exportedResults, fileName);
          vm.action = null;
          $mdDialog.hide();
        })        
        .catch(function() {
          vm.action = null;
        });
    }
    
    function disableUnsupportedResults() {
      var exporter = vm.selectedExporter;
      _.each(vm.results, function(pollResults) {
        _.each(pollResults, function(result) {
          result.disabled = !canExportResult(exporter, result);
        });
      });
    }
    
    function generateFileName(groups, exporter) {
      return 'MARS Result - '
        + _.first(groups).collection.name
        + ' - '
        + (vm.groups.length === 1
          ? _.first(groups).name + ' - '
          : '')
        + exporter.name
        + ' ('
        + $filter('date')(
            new Date(), 
            'yyyy-MM-dd HH.mm'
          )
        + ')'
        + exporter.extension;
    }
    
    function filterOutEmptyResults(results) {
      return _.filter(results, function(result) {
        return result.responsesCount > 0;
      });
    }
    
    function getPollsGroupedById(groups) {
      return _.extend.apply(
        null,
        _.map(groups, function(group) {
          return _.indexBy(group.polls, '_id');
        })
      );
    }
    
    function getSelectedResultIds() {
      var resultIds = [];
      _.each(vm.selectedResults, function(selected, resultId) {
        if (selected)
          resultIds.push(resultId);
      });
      return resultIds;
    }
    
    function groupResultsByPoll(results) {
      return _.groupBy(results, function(result) {
        return result.poll._id;
      });
    }
    
    function isSelectAllDisabled() {
      return !_.some(_.keys(vm.results), function(pollId) {
        return !isSelectAllDisabledForPoll(pollId);
      });
    }
    
    function isSelectAllDisabledForPoll(pollId) {
      return !vm.results 
        || !_.some(vm.results[pollId], function(result) {
          return !result.disabled;
        });
    }
    
    function loadResults() {
      vm.action = "Loading results";
      var exporter = vm.selectedExporter;
      var pollsById = getPollsGroupedById(vm.groups); 
      return myPollsService.listResults(_.keys(pollsById))
        .then(filterOutEmptyResults)
        .then(function(results) {
          _.each(results, function(result) {
            result.disabled = !canExportResult(exporter, result);
            result.lastActivation = _.last(result.activations);
            result.poll = pollsById[result.poll];
          });
          vm.results = groupResultsByPoll(results);
          vm.action = null;
      })
      .catch(function(err) {
        $log.error('Failed to load results: ', err);
        $mdDialog.hide();
      });
    }
    
    function mapSubscribersToResponses(subscribersById, results) {
      _.each(results, function(result) {
        _.each(result.responses, function(response) {
          if (_.isString(response.user))
            response.user = subscribersById[response.user];
        });
      });
    }
    
    function selectedExporterChanged() {
      var pluginExporter = $injector.get(vm.selectedExporter.factory);
      _.extend(vm.selectedExporter, pluginExporter);
      disableUnsupportedResults();
    }
    
    function toggleSelectAll() {
      if (isSelectAllDisabled())
        return;
      var selectAll = !areAllSelected();
      _.each(vm.results, function(pollResults) {
        _.each(pollResults, function(result) {
          vm.selectedResults[result._id] = !result.disabled && selectAll;
        });
      });
    }
    
    function toggleSelectAllForPoll(pollId) {
      if (isSelectAllDisabledForPoll(pollId))
        return;
      var selectAll = !areAllSelectedForPoll(pollId);
      _.each(vm.results[pollId], function(result) {
        vm.selectedResults[result._id] = selectAll;
      });
    }
    
  }
  
})();