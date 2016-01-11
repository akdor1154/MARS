(function() {
  'use strict';
  
  angular
    .module('app.plugins')
    .provider('plugins', pluginsProvider);
    
  
  pluginsProvider.$inject = [
    '$stateProvider', 
    'inflectorProvider', 
    'PLUGIN'
  ];
  
  function pluginsProvider(
      $stateProvider, 
      inflectorProvider, 
      PLUGIN) {
    var $injector = angular.injector(['ng']);
    var $log = $injector.get('$log');
    
    var self = this;
    var _registeredPlugins = {};
    
    init();
    
    
    var provider = {
      register: register,
      $get: Plugins
    }
    return provider;
    
    
    function init() {
      for(var type in PLUGIN) {
        _registeredPlugins[type] = [];
      }
    }
    
    function register(pluginType, pluginName, options) {
      _verifyValidPluginType(pluginType);
      var plugin = { name: pluginName }
      options && (plugin.options = options);
      _registeredPlugins[pluginType].push(plugin);
      $log.debug('Registered ' + inflectorProvider.humanize(pluginType) + ': ' + pluginName);
      return self;
    }
    
    function _verifyValidPluginType(pluginType) {
      if (!_registeredPlugins.hasOwnProperty(pluginType))
        throw new Error('Invalid plugin type "' + pluginType + '"');
    }

    
    Plugins.$injector = ['$rootScope', '$q', '$window', '$document'];
    
    function Plugins($rootScope, $q, $window, $document) {
      
      var service = {
        loadScript: loadScript,
        registered: registered
      }
      return service;
      
      
      function loadScript(path, objectName) {
        var d = $q.defer();
        
        if ($window[objectName])
          return $q.resolve($window[objectName]);
        
        var onScriptLoad = function() {
          $rootScope.$apply(function() { 
            d.resolve(window[objectName]); 
          });
        }
        
        var scriptTag = $document[0].createElement('script');
        scriptTag.type = 'text/javascript'; 
        scriptTag.async = true;
        scriptTag.src = path;
        scriptTag.onreadystatechange = function () {
          if (this.readyState == 'complete') 
            onScriptLoad();
        }
        scriptTag.onload = onScriptLoad;
        
        var s = $document[0].getElementsByTagName('body')[0];
        s.appendChild(scriptTag);
        
        return d.promise;
      }
      
      function registered(pluginType) {
        _verifyValidPluginType(pluginType);
        return _registeredPlugins[pluginType];
      }
      
   }
    
  }
  
})();