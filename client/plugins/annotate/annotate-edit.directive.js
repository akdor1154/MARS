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


      // Creating an angular element from the <img> and only setting up the canvas once the image has loaded
      var backImageAng = angular.element(backImage);
      var drawingLayerAng = angular.element(drawingLayer);
      backImageAng.bind('load', function(){
        drawingContext.drawImage(backImage,0,0, drawingLayer.width, (480*drawingLayer.width/800));
      });

      drawingLayerAng.on('touchstart', handleTouchStart);
      drawingLayerAng.on('touchend', handleTouchEnd);
      drawingLayerAng.on('touchleave', handleTouchMove);
      drawingLayerAng.on('touchmove', handleTouchMove);
      drawingLayerAng.on('mousedown', handleMouseDown);
      drawingLayerAng.on('mouseup', handleMouseUpOut);
      drawingLayerAng.on('mouseout', handleMouseUpOut);
      drawingLayerAng.on('touchmove', handleMouseMove);

      function handleTouchStart(event) {

        event.preventDefault();
        var touches = event.changedTouches;

        for(var i=0; i < touches.length; i++) {
          if(current_identifier == null)
            current_identifier = touches[i].identifier;
          if(touches[i].identifier != current_identifier) continue;
          var newObject = {X: 800/drawingLayer.clientWidth*(touches[i].pageX-drawingLayer.offsetLeft), Y: 480/drawingLayer.clientHeight*(touches[i].pageY-drawingLayer.offsetTop)};
          startStroke(newObject);
          return;
        }
      }

      function handleMouseDown(event) {

        isDragging = true;
        if(!("pageX" in event)) {
          event.pageX = event.clientX;
          event.pageY = event.clientY;
        }
        var newObject = {X: 800/drawingLayer.clientWidth*(event.pageX-drawingLayer.offsetLeft), Y: 480/drawingLayer.clientHeight*(event.pageY-drawingLayer.offsetTop)};
        startStroke(newObject);
      }

      function handleMouseUpOut(event) {
        isDragging = false;
      }

      function startStroke(event) {

        var fixedX = event.X;
        var fixedY = event.Y;

        var newObject = {X: fixedX, Y: fixedY};

        savedDraws.strokes.push(new Array());
        savedDraws.strokes[savedDraws.strokes.length-1].push(copyTouch(newObject));
        return;
      }

      function handleMouseMove(event) {

        if(!("pageX" in event)) {
          event.pageX = event.clientX;
          event.pageY = event.clientY;
        }

        if(isDragging) {
          var newObject = {X: 800/drawingLayer.clientWidth*(event.pageX-drawingLayer.offsetLeft), Y: 480/drawingLayer.clientHeight*(event.pageY-drawingLayer.offsetTop)};
          continueStroke(newObject);
        }
      }

      function handleTouchMove(event) {

        event.preventDefault();
        var touches = event.changedTouches;

        for(var i=0; i < touches.length; i++) {
          if(touches[i].identifier != current_identifier) continue;

          var newObject = {X: 800/drawingLayer.clientWidth*(touches[i].pageX-drawingLayer.offsetLeft), Y: 480/drawingLayer.clientHeight*(touches[i].pageY-drawingLayer.offsetTop)};
          continueStroke(newObject);
          return;
        }
      }

      function handleTouchEnd(event) {

        event.preventDefault();
        var touches = event.changedTouches;

        for(var i=0; i < touches.length; i++) {
          if(touches[i].identifier != current_identifier) continue;
          current_identifier = null;

          var newObject = {X: 800/drawingLayer.clientWidth*(touches[i].pageX-drawingLayer.offsetLeft), Y: 480/drawingLayer.clientHeight*(touches[i].pageY-drawingLayer.offsetTop)};
          continueStroke(newObject);
          return;
        }

      }

      function continueStroke(event) {
        var ongoingTouches = savedDraws.strokes[savedDraws.strokes.length-1];

        var fixedX = event.X;
        var fixedY = event.Y;

        var newObject = {X: fixedX, Y: fixedY};

        drawingContext.beginPath();
        drawingContext.moveTo(ongoingTouches[ongoingTouches.length-1].X, ongoingTouches[ongoingTouches.length-1].Y);
        drawingContext.lineTo(fixedX, fixedY);
        drawingContext.lineWidth = 4;
        drawingContext.stroke();
        ongoingTouches.push(copyTouch(newObject));
        return;
      }

      function copyTouch(event) {
        return {X: event.X, Y: event.Y};
      }
    }

  }

})();
