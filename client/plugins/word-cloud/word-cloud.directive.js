(function() {
  'use strict';
  
  angular
    .module('plugins.word-cloud')
    .directive('wordCloud', wordCloud);
      
  wordCloud.$inject = [
    '$log', 
    '$compile', 
    '$q', 
    '$window', 
    'plugins'
  ];
    
  function wordCloud(
      $log, 
      $compile,
      $q, 
      $window, 
      plugins
    ) {
    $log = $log.getInstance('wordCloud');
    
    var directive = {
      link: link,
      restrict: 'EA',
      scope: {
        words: '='
      },
    }
    return directive;
    
    function link(scope, element, attrs) {      
      plugins.loadScript('assets/bower_components/d3/d3.min.js', 'd3')
        .then(function() {
          return plugins.loadScript('assets/bower_components/d3-cloud/build/d3.layout.cloud.js', 'cloud');
        })
        .then(function() {
          wordcloud(scope, element[0]);
        });
    }
    
    function wordcloud(scope, parentElement) {
      var fill = d3.scale.category20(),
          height = Number.NaN,
          width = Number.NaN,
          words = [];
              
      var svg = d3.select(parentElement).append('svg'),
          g = svg.append('g');
        
      var layout = d3.layout.cloud()
        .padding(5)
        .rotate(0)
        .font('Impact')
        .text(function(d) { return d.text.substring(0,24); })
        .on('end', render);
        
      
      function render(words, size) {
        $log.debug('render');
        
        var cloud = g.selectAll('text')
          .data(words, function(d) { return d.text.substring(0,24); });
        
        cloud.enter()
          .append('text')
            .attr('font-size', 1)
            .attr('text-anchor', 'middle')
            .style('fill', function(d, i) { return fill(i); })
            .style('font-family', 'Impact')
            .text(function(d) { return d.text.substring(0,24); });
            
        cloud
          .transition()
            .duration(1000)
            .attr('transform', function(d) {
              return 'translate(' + [d.x, d.y] + ')rotate(' + d.rotate + ')';
            })
            .style('font-size', function(d) { return d.size + 'px'; })
            
        cloud.exit()
          .transition()
            .duration(200)
            .attr('font-size', 1)
            .style('fill-opacity', 1e-6)
            .remove();
            
        g
          .attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')');
      }
      
      function update(words) {
        $log.debug('update');
        
        // A 5:2 aspect ratio seemed to work well with the space available
        // at common screen resolutions.
        svg.style('width', '100%');
        width = parseInt(svg.style('width'), 10);
        height = width * 2 / 5;
        
        // Don't proceed if height or width is NaN, it can cause the 
        // browser to lock up during layout.
        if (isNaN(width) || isNaN(height))
          return;

        svg
          .attr('width', width)
          .attr('height', height);
        
        var values = _.pluck(words, 'value'),
            min = _.min(values),
            max = _.max(values),
            sumOfUnique = _.reduce(_.unique(values), function(a, b) {
              return a + b;
            });

        var minFontSize = Math.min( width/10/(values.length/3), 25),
            maxFontSize = 3*minFontSize,
            fontSize = d3.scale.log()
              .range([minFontSize, maxFontSize]);
        if (words.length)
          fontSize.domain([min, max]);
            
        layout
          .stop()
          .size([width, height])
          .fontSize(function(d) { return fontSize(d.value); })
          .words(words)
          .start();
      }
      var updateThrottled = _.throttle(update, 2000);
  
      // SVG elements use pixel sizes, so the sizes need to be recalculated when 
      // the window is resized to remain proportional.
      var onResize = _.debounce(function() {
        update(words);
        scope.$apply();
      }, 500);
      angular.element($window).bind('resize', onResize);
      scope.$on('$destroy', function() {
        angular.element($window).unbind('resize', onResize);
      });
      
      scope.$watch('words', function(newValue, oldValue) {
        if(!angular.isArray(newValue))
          return;
        angular.copy(scope.words, words);
        updateThrottled(words);
      }, true);
    }
    
  }
  
})();