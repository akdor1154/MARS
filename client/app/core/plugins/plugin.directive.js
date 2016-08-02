(function() {
  'use strict';
  
  angular
    .module('app.plugins')
    .directive('marsPlugin', marsPlugin);
      
  marsPlugin.$inject = ['$log', '$compile'];
    
  function marsPlugin($log, $compile) {
    $log = $log.getInstance('marsPlugin');
    
    var directive = {
      link: link,
      restrict: 'E',
      scope: {
        'marsPluginName': '=',
        'marsPluginView': '@',
        'poll': '=',
        'result': '=',
        'viewSettings': '='
      },
      template: '<ng-include src="marsPluginTemplatePath"></ng-include>'
    }
    return directive;
    
    function link(scope, element, attrs) {
      attrs.$observe('marsPluginView', function(view) {
        scope.$watch('marsPluginName', function(pluginName) {
          if (!view || !pluginName)
            return;
          scope.marsPluginTemplatePath = 
            'plugins/' + pluginName + '/' + pluginName + '.' + view + '.html';
        });
      });
    }
    
  }
  
})();