(function() {
  'use strict';
  
  angular
    .module('app.myPolls')
    .directive('marsFocusWhen', marsFocusWhen);
      
  marsFocusWhen.$inject = ['$log', '$mdUtil', '$timeout'];
    
  function marsFocusWhen($log, $mdUtil, $timeout) {
    $log = $log.getInstance('marsFocusWhen');
    
    var directive = {
      link: link,
      restrict: 'AE',
      scope: {
        'marsFocusWhen': '='
      }
    }
    return directive;
    
    function link(scope, element, attrs) {
      scope.$watch('marsFocusWhen', function(newValue, oldValue) {
        if (!newValue)
          return;
        var focusEl = $mdUtil.findFocusTarget(element, '[mars-autofocus]');
        $log.debug('Autofocus: ', focusEl || 'No target found. Add "md-autofocus" attribute to an element.');
        $timeout(function() { focusEl && focusEl.focus(); });
      });
    }
    
  }
  
})();