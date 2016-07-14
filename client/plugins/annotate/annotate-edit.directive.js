(function() {
  'use strict';
  
  angular
    .module('plugins.annotate')
    .directive('annotateView', annotateView);
      
  annotateView.$inject = [
    '$log', 
    '$compile', 
    '$q', 
    '$window', 
    'plugins'
  ];
    
  function annotateView(
    $log, 
    $compile,
    $q, 
    $window, 
    plugins
  ) {
    $log = $log.getInstance('annotateView');
    
    var directive = {
      link: link,
      restrict: 'EA',
      template: '<md-card><img id="back-image" src="assets/img/sample.jpg"><canvas id="drawing-layer" width="800" height="480"></canvas></md-card>',
      scope: {
        words: '='
      },
    }
    return directive;
    
    function link(scope, element, attrs) {      

      var drawingLayer = element.find("canvas")[0];
      var backImage = element.find("img")[0];
      var drawingContext = drawingLayer.getContext("2d");

// console.log(backImage)
      var backImageAng = angular.element(backImage)
      backImageAng.bind('load', function(){
        drawingContext.drawImage(backImage,0,0, drawingLayer.width, (480*drawingLayer.width/800));      
      })
    }
    
  }
  
})();