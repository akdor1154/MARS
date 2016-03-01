(function() {
  'use strict';
  
  angular
    .module('app.plugins')
    .factory('pollPluginService', pollPluginService);
      
  pollPluginService.$inject = ['$log', '$q', 'debounce', 'marsService'];
    
  function pollPluginService($log, $q, debounce, marsService) {
    $log = $log.getInstance('pollPluginService');
    
    var pendingSaves = {};
    var savingPromise = null;
    var saveTimeout = null;
    var _updateNextPollDebounced = debounce(_updateNextPoll, 1000);
    
    return {
      beforeSave: beforeSave,
      getLastResponse: getLastResponse,
      submitResponse: submitResponse,
      updatePoll: updatePoll
    }
    
    function beforeSave(scope, obj, callback) {
      obj.__beforeSave = callback;
      scope.$on('$destroy', function() {
        delete obj.__beforeSave;
      });
    }
    
    function getLastResponse(result) {
      var data = {
        _id: marsService.id(result)
      }
      return marsService.request('result last response', data);
    }
    
    function submitResponse(result, response) {
      var data = {
        _id: marsService.id(result),
        response: response
      }
      return marsService.request('response', data);
    }
    
    function updatePoll(poll, immediate) {
      _queueUpdate(poll);
      immediate ? _updateNextPoll() : _updateNextPollDebounced();
    }
    
    function _executeCallback(obj, callbackName, argsArray) {
      if (!angular.isFunction(obj['__' + callbackName]))
        return;
      obj['__' + callbackName].apply(null, argsArray);
    }
    
    function _dequeueUpdate() {
      var next = null,
          nextId = null;
      for (nextId in pendingSaves) break;
      if (nextId) {
        next = pendingSaves[nextId];
        delete pendingSaves[nextId];
      }
      return next;
    }
    
    function _queueUpdate(poll) {
      var id = marsService.id(poll);
      pendingSaves[id] = poll;
    }
    
    function _updateNextPoll() {
      var poll = _dequeueUpdate();
      if (!poll) return;
      poll._isSaving = true;
      var pollCopy = angular.copy(poll);
      marsService.depopulate(pollCopy, ['group', 'pollCollection']);
      _executeCallback(poll, 'beforeSave', [pollCopy]);
      return marsService.request('poll update', pollCopy)
        .then(function() {
          // After a poll has successfully been updated, it is no longer
          // considered new.
          delete poll._isNew;
          delete poll._isSaving;
          return _updateNextPoll();
        });
    }
  }
  
})();