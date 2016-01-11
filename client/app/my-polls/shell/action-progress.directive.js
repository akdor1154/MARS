(function() {
  'use strict';
  
  angular
    .module('app.myPolls')
    .directive('marsActionProgress', marsActionProgress);
      
  marsActionProgress.$inject = ['$log'];
    
  function marsActionProgress($log) {
    $log = $log.getInstance('marsActionProgress');
    
    var directive = {
      restrict: 'E',
      scope: {
        action: '=',
        mdDiameter: '@',
        orientation: '@',
      },
      templateUrl: 'app/my-polls/shell/action-progress.directive.html',
      transclude: true
    }
    return directive;
  }
  
})();