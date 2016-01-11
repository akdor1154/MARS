(function() {
  'use strict';
  
  angular
    .module('plugins.word-cloud')
    .directive('wordCloud', wordCloud);
      
  wordCloud.$inject = ['$log', '$q', '$interval', '$window', 'plugins'];
    
  function wordCloud($log, $q, $interval, $window, plugins) {
    $log = $log.getInstance('wordCloud');
    
    var directive = {
      link: link,
      restrict: 'EA',
      scope: {
        words: '=',
        wordsUpdated: '='
      },
    }
    return directive;
    
    function link(scope, ele, attrs) {
      var loadScripts = [
        plugins.loadScript('assets/bower_components/d3/d3.min.js', 'd3'),
        plugins.loadScript('assets/bower_components/d3-cloud/build/d3.layout.cloud.js', 'cloud'),
      ];
    
      $q.all(loadScripts).then(function(scripts) {
        var d3 = scripts[0],
            parentElement = ele[0];
        
        var words = [],
            immediate = false;
                
        var svg = d3.select(parentElement).append('svg'),
            g = svg.append('g');
          
        var width = 500,
            height = 200;
          
        var fill = d3.scale.category20();
          
        var layout = d3.layout.cloud()
          .padding(5)
          .rotate(0)
          .font('Impact')
          .text(function(d) { return d.text })
          .on('end', render);
        
        function render(words, size) {
          $log.debug('render');
          $log.debug('words = ', words);
          
          var scale = size
            ? Math.min(
                width / Math.abs(size[1].x - width / 2), 
                width / Math.abs(size[0].x - width / 2), 
                height / Math.abs(size[1].y - height / 2), 
                height / Math.abs(size[0].y - height / 2)
              ) / 2
            : 1;
        
          var text = g.selectAll('text')
            .data(words, function(d) { return d.text.toLowerCase(); });
              
          text.transition()
            .duration(1000)
            .attr('transform', function(d) {
              return 'translate(' + [d.x, d.y] + ')rotate(' + d.rotate + ')';
            })
            .style('font-size', function(d) { return d.size + 'px'; })
              
          text.enter().append('text')
            .attr('text-anchor', 'middle')
            .attr('transform', function(d) {
              return 'translate(' + [d.x, d.y] + ')rotate(' + d.rotate + ')';
            })
            .style('font-family', 'Impact')
            .style('font-size', '1px')
            .style('fill', function(d, i) { return fill(i); })
            .text(function(d) { return d.text })
            .transition()
              .duration(1000)
              .style('font-size', function(d) { return d.size + 'px'; });
            
          if (immediate) {
            g.attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')scale(' + scale + ')');
          }
          else {
            g.transition()
              .delay(1000)
              .duration(750)
              .attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')scale(' + scale + ')');
          }
        }
        
        function update(words) {
          svg.style('width', '100%');
          // A 5:2 aspect ratio seemed to work well with the space available
          // at common screen resolutions.
          width = parseInt(svg.style('width'), 10)
          height = width * 2 / 5;
          
          var values = _.pluck(words, 'value'),
              min = _.min(values),
              max = _.max(values);
          
          var fontSize = d3.scale.linear()
            .range([width * 0.025, width * 0.1]);
          if (words.length)
            fontSize.domain([min, max]);
            
          $log.debug('fontSize.domain = ', fontSize.domain());
   
          // Don't proceed if height or width is NaN, it causes the browser
          // to lock up during layout.
          if (isNaN(width) || isNaN(height))
            return;
   
          svg
            .attr('width', width)
            .attr('height', height);
              
          layout
            .stop()
            .size([width, height])
            .fontSize(function(d) { return fontSize(d.value); })
            .words(words)
            .start();
        }
        
        // Initial render
        update(words);
    
        // SVG elements use pixel sizes, so the sizes need to be recalculated when 
        // the window is resized to remain proportional.
        var onResize = function() {
          update(words);
          scope.$apply();
        }
        angular.element($window).bind('resize', onResize);
        scope.$on('$destroy', function() {
          angular.element($window).unbind('resize', onResize);
        });
        
        // Updating too quickly looks terrible. Limit updates to 
        // 3sec intervals.
        var updateInterval = $interval(function() {
          if (!scope.wordsUpdated) 
            return;
          $log.debug('words = ', words);
          update(words);
          scope.wordsUpdated = false;
        }, 3000);
        
        scope.$on('$destroy', function() {
          $interval.cancel(updateInterval);
        });

        // Watch for data changes and flag updates
        scope.$watch('wordsUpdated', function(newValue, oldValue) {
          if (!newValue) {
            scope.wordsUpdated = false;
            return;
          }
          if(!angular.isArray(scope.words)) {
            $log.warn('Attribute "words" should be an array');
            scope.wordsUpdated = false;
            return;
          }
          words = scope.words
        });
        
        // When the words collection is first set, render the word cloud
        // straight away without animations.
        var wordsWatch = scope.$watch('words', function(newValue, oldValue) {
          if(!angular.isArray(scope.words)) {
            $log.warn('Attribute "words" should be an array');
            scope.wordsUpdated = false;
            return;
          }
          words = scope.words
          immediate = true;
          update(words);
          immediate = false;
          scope.wordsUpdated = false;
          // Remove the watch
          wordsWatch();
        });

      });
    }
    
  }
  
})();