(function() {
  'use strict';
  
  angular
    .module('app.myPolls')
    .factory('shell', shell);
      
  shell.$inject = ['$log', '$rootScope'];
    
  function shell($log, $rootScope) {
    $log = $log.getInstance('shell');
    
    init();
    
    var service = {
      back: {
        state: null,
        stateParams: null
      },
      clearSearch: clearSearch,
      hideSearch: hideSearch,
      menu: {
        items: [],
        show: false
      },
      search: {
        callback: false,
        phrase: '',
        show: false
      },
      searchPhraseChanged: searchPhraseChanged,
      setBack: setBack,
      setMenu: setMenu,
      setSearch: setSearch,
      setTitle: setTitle,
      showSearch: showSearch,
      title: ''
    };
    return service;
    
    function init() {
      $rootScope.$on('$stateChangeSuccess', reset);
    }
    
    function clearSearch() {
      service.search.phrase = '';
      searchPhraseChanged();
    }
    
    function hideSearch() {
      clearSearch();
      service.search.show = false;
    }
    
    function reset() {
      service.back.state = null;
      service.back.stateParams = null;
      service.menu.items = [];
      service.menu.show = false;
      service.search.callback = false;
      service.search.phrase = '';
      service.search.show = false;
      service.title = '';
    }
    
    function searchPhraseChanged() {
      if (!angular.isFunction(service.search.callback))
        return;
      service.search.callback(service.search.phrase);
    }
    
    function setBack($scope, state, stateParams) {
      service.back.state = state;
      service.back.stateParams = stateParams;
      // $scope.$on('$destroy', function() {
      //   service.back.state = null;
      //   service.back.stateParams = null;
      // });
    }
    
    function setMenu($scope, menuItems) {
      service.menu.items = menuItems;
      service.menu.show = true;
      // $scope.$on('$destroy', function() {
      //   service.menu.items = [];
      //   service.menu.show = false;
      // });
    }
    
    function setSearch($scope, searchCallback) {
      service.search.callback = searchCallback;
      // $scope.$on('$destroy', function() {
      //   service.search.callback = false;
      //   hideSearch();
      // });
    }
    
    function setTitle($scope, title) {
      service.title = title;
      // $scope.$on('$destroy', function() {
      //   service.title = '';
      // });
    }
    
    function showSearch() {
      service.search.show = true;
    }
    
  }
  
})();