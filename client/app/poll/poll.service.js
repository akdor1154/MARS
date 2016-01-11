(function() {
  'use strict';
  
  angular
    .module('app.poll')
    .factory('pollService', pollService);
    
  
  pollService.$inject = [
    '$log', 
    '$rootScope', 
    '$q', 
    'auth', 
    'marsService'
  ];
  
  function pollService($log, $rootScope, $q, auth, marsService) {
    $log = $log.getInstance('pollService');
   
    var _activations = {},
        _active = null;
    
    marsService.on('poll activate', _onPollActivate);
    marsService.on('result resume', _onPollActivate);
    marsService.on('result deactivate', _onResultDeactivate);
    
    return ({
      activePoll: activePoll,
      getActivePolls: getActivePolls,
      nextActivePoll: nextActivePoll,
      onActivePollsChanged: onActivePollsChanged,
      prevActivePoll: prevActivePoll,
      subscribe: subscribe
    });
    
/**
 * Return the currently selected active poll
 *
 *
 */
    function activePoll() {
      if (!_active)
        return null;
      return _activations[_active];
    }
    
/**
 * Load all active polls
 *
 * After loading, active polls are accessible by calling activePoll(),
 * nextActivePoll() and prevActivePoll().
 */
    function getActivePolls() {
      $log.info('Getting active polls');
      return marsService.request('poll list active').then(
        function(_activePolls) {
          _activations = {};
          if (_activePolls.length > 0) {
            _activePolls.forEach(function(a) {
              _activations[a._id] = a;
            });
            _active = _activePolls[0]._id;
          }
          _activePollsChanged();
          return $q.resolve();
        },
        $q.reject
      );
    }
    
/**
 * Select and return the next active poll
 *
 */
    function nextActivePoll() {
      var ids = Object.keys(_activations),
        currentIndex = ids.indexOf(_active),
        nextId = currentIndex + 1;
      if (nextId >= ids.length)
        nextId = 0;
      _active = ids[nextId];
      return activePoll();
    }
    

/**
 * Register a listener for the onActivePollsChanged event
 *
 */
    function onActivePollsChanged($scope, callback) {
      var handler = $scope.$on('activePollsChanged', function(event, count) {
        callback(event, count);
        if (!$scope.$$phase)
          $scope.$apply();
      });
      $scope.$on('$destroy', handler);
    }

    
/**
 * Select and return the previous active poll
 *
 */
    function prevActivePoll() {
      var ids = Object.keys(_activations),
        currentIndex = ids.indexOf(_active),
        prevId = currentIndex - 1;
      if (prevId <= 0)
        prevId = ids.length - 1;
      _active = ids[prevId];
      return _activePoll();
    }
    
// /**
 // * Submit a response to an activation instance
 // *
 // */
    // function submitResponse(activation, response) {
      // if (angular.isString(activation))
        // activation = { _id: activation };
      // else
        // activation = _minify(angular.copy(activation));
      // activation.response = response;
      // return marsService.request('response', activation);
    // }
    
/**
 * Subscribe to view polls belonging the collection identified 
 * by collectionToken
 *
 */
    function subscribe(collectionToken) {
      return marsService.request('collection subscribe', collectionToken)
        .then(
          function(user) {
            auth.user(user);
            $log.info('Subscribed to collection: ', collectionToken);
          }
        );
    }
    
/**
 * Raise an activePollsChanged event
 *
 */
    function _activePollsChanged() {
      $log.debug('active = ', _active);
      $rootScope.$broadcast('activePollsChanged', Object.keys(_activations).length);
    }
    

/**
 * Return a promise that will be rejected
 *
 */
    function _errorPromise(message) {
      return $q(function(resolve, reject) {
        reject(message);
      });
    }
    
    
/**
 * Minimise the size of an activation document
 *
 * Replaces activation.poll with the poll id, and activation.result with
 * the result id.
 */
    function _minify(activation) {
      if (angular.isObject(activation.poll))
        activation.poll = activation.poll._id;
      if (angular.isObject(activation.result))
        activation.result = activation.result._id;
      return activation;
    }
    
    
/**
 * Event listener: onPollActivated
 *
 * Add the activation instance to the collection of activations. If there
 * were no active polls, select the newly active poll.
 */
    function _onPollActivate(event, result) {
      $log.debug('result = ', result);
      _activations[result._id] = result;
      if (_active === null)
          _active = result._id;
      $log.info('Poll activated: ' + result._id);
      $log.debug('activations: ', _activations);
      _activePollsChanged();
    }
    
/**
 * Event listener: onPollDeactivated
 *
 * Remove the activation instance from the collection of activations. If the 
 * removed activation was the selected active poll, select the next active 
 * poll.
 */
    function _onResultDeactivate(event, result) {
      if (_active === result._id) {
        if (Object.keys(_activations).length > 1)
          nextActivePoll();
        else
          _active = null;
      }
      delete _activations[result._id];
      $log.info('Result deactivated: ', result._id);
      $log.debug('activations: ', _activations);
      _activePollsChanged();
    }
    
  }
  
})();