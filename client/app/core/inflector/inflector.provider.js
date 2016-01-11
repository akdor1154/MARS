(function() {
  'use strict';
  
  angular
    .module('app.inflector')
    .provider('inflector', inflectorProvider);
  
    
  function inflectorProvider() {
      
    return {
      classify: classify,
      humanize: humanize,
      hyphenate: hyphenate,
      $get: Inflector
    };
    
    
    function classify(hyphenatedOrUnderscored) {
      return hyphenatedOrUnderscored
        .toLowerCase()
        .replace(/(^|_|-)([a-z])/gi, function($0, $1, $2) {
          return $2.toUpperCase();
        });
    }
    
    function humanize(hyphenatedOrUnderscored) {
      return hyphenatedOrUnderscored
        .toLowerCase()
        .replace(/(^|(_|-))([a-z])/gi, function($0, $1, $2, $3) {
          return ($1 ? ' ' : '') + $3.toUpperCase();
        });
    }
    
    function hyphenate(humanized) {
      return humanized
        .replace(' ', '-')
        .toLowerCase();
    }
    
    
    function Inflector() {
      
      var service = {
        classify: classify,
        humanize: humanize,
        hyphenate: hyphenate
      };
      return service;
      
    }
    
  }
  
})();