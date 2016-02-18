(function() {
  'use strict';
  
  angular
    .module('app.data')
    .factory('marsService', marsService);
    
  marsService.$inject = ['$rootScope', '$log', '$q'];    
  
  function marsService($rootScope, $log, $q) {
    $log = $log.getInstance('marsService');
   
    var socket = null;
    var pendingListeners = [];
    
    return {
      clone: clone,
      depopulate: depopulate,
      id: id,
      on: on,
      request: request
    }
    
    
    function clone(obj, keys) {
      $log.debug('keys = ', keys);
      if (angular.isString(keys)) {
        keys = [keys];
      }
      if (angular.isArray(keys)) {
        keys = _.union(keys, ['_id']);
        return _.pick(obj, keys);
      }
      else {
        return _.clone(obj);
      }
    }
    
    
    function depopulate(obj, keys, idField) {
      idField = idField || '_id';
      if (angular.isString(keys)) {
        keys = [keys];
      }
      if (angular.isArray(keys)) {
        keys.forEach(function(key) {
          if (angular.isObject(obj[key]) && _.has(obj[key], idField))
            obj[key] = obj[key][idField];
          else if (angular.isArray(obj[key]))
            obj[key] = _.map(obj[key], function(subObj) {
              return _.has(subObj, idField)
                ? subObj[idField]
                : subObj
            });
        });
      }
    }
    
    function id(obj) {
      if (angular.isObject(obj) && _.has(obj, '_id'))
        return obj._id;
      if (angular.isString(obj))
        return obj;
      return null;
    }
    
    function on(name, listener) {
      if (!socket) {
        pendingListeners.push({ name: name, listener: listener });
        return;
      }
      $rootScope.$on(name, listener);
      if (!socket.hasListeners(name)) {
        socket.on(name, function(data) {
          $log.debug('Received: ' + name + ' [event]');
          $rootScope.$apply(function() {
            $rootScope.$emit(name, data);
          });
        });
      }
    }
    
    function request(action, data) {
      var d = $q.defer();
      
      if (!socket)
        _init();
     
      socket.once(action, function(responseData) {
        $log.debug('Received: ' + action + ' [response]', responseData);
        $rootScope.$apply(function() {
          if (responseData && responseData.hasOwnProperty('error')) {
            $log.error(
              'Failed: ' 
              + responseData.error.code 
              + ' - ' 
              + responseData.error.message
            );
            d.reject(responseData.error);
          }
          else {
            d.resolve(responseData);
          }
        });
      });
      
      $log.debug('Sent: ' + action);
      socket.emit(action, data);
      return d.promise;
    }
    
    
    function _init() {
      try { socket = io(); }
      catch (err) { $log.error(err); }
      pendingListeners.forEach(function(l) {
        on(l.name, l.listener);
      });
      pendingListeners = [];
    }
    
  }
  
})();
