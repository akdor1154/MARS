(function() {
  'use strict';
  
  angular
    .module('app.myPolls')
    .directive('marsScrollTo', marsScrollTo);
      
  marsScrollTo.$inject = ['$log', '$anchorScroll', '$timeout'];
    
  function marsScrollTo($log, $anchorScroll, $timeout) {
    $log = $log.getInstance('marsScrollTo');
    
    var directive = {
      link: link,
      restrict: 'A',
      scope: {
        'marsScrollTo': '@',
        'marsScrollWhen': '='
      }
    }
    return directive;
    
    function link(scope, ele, attrs) {
      attrs.$observe('marsScrollTo', function(scrollTo) {
        scope.$watch('marsScrollWhen', function(newValue, oldValue) {
          if (!newValue) 
            return;
          $log.debug('Scroll to: ' + scrollTo);
          $timeout(function() { $anchorScroll(scrollTo); });
        });
      });
    }
    
  }
  
})();