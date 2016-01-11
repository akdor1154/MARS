(function() {
  'use strict';
  
  angular
    .module('app.auth')
    .factory('auth', auth);
      
  auth.$inject = ['$log', '$http', '$q', '$window'];
  
  function auth($log, $http, $q, $window) {
    $log = $log.getInstance('auth');
  
    var _user = null;
  
    return {
      isAuthenticated: isAuthenticated,
      login: login,
      logout: logout,
      user: user
    }
    
    function isAuthenticated() {
      if (_user !== null)
        return $q.resolve(_user);
      return $http.post('is-authenticated').then(function(res) {
        _user = res.data;
        return $q.resolve(_user);
      }).catch(function(res) {
        if (res.status === 401)
          return $q.reject();
        $log.error('isAuthenticated failed: ', res);
      });
    }
    
    function login(user) {
      return $http.post('login', user).then(function(res) {
        _user = res.data;
        $log.info('Logged in: ', _user.username);
        return _user;
      }).catch(function(res) {
        $log.error('Login failed: ', res.status + ' - ' + res.data);
        return $q.reject({ code: res.status, message: res.data });
      });
    }
    
    function logout(user) {
      return $http.post('logout').then(function(res) {
        $log.info('Logged out: ', _user.username);
        _user = null;
      }).then(function() {
        $window.location.hash = '';
        $window.location.reload();
      }).catch(function(res) {
        $log.error('Log out failed: ', res.status + ' - ' + res.data);
        return $q.reject({ code: res.status, message: res.data });
      });
    }
    
    function user(updatedUser) {
      if (updatedUser) {
        if (_user === null)
          throw new Error('Cannot update user, you are not logged in');
        angular.copy(updatedUser, _user);
      }
      return _user;
    }
  }
  
})();