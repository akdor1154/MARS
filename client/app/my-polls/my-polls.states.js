(function() {
  'use strict';
  
  angular
    .module('app.myPolls')
    .config(statesConfig);
      
    statesConfig.$inject = ['$stateProvider'];
    
    function statesConfig($stateProvider) {
      $stateProvider
        .state('myPolls', {
          templateUrl: 'app/my-polls/shell/shell.html',
          controller: 'ShellController as vm'
        })
        // Entry state that automatically redirects to myPolls.upcoming .
        // Setting a url for the parent myPolls state means if the user
        // presses back they can end up at the myPolls state which should
        // never happen. The user should always be in one of the child 
        // states of myPolls.
        .state('myPolls.entry', {
          url: '/my-polls',
          onEnter: [
            '$state',
            function($state) {
              $state.go('myPolls');
            }
          ]
        })
        .state('myPolls.upcoming', {
          url: '/my-polls/upcoming',
          templateUrl: 'app/my-polls/upcoming/upcoming.html',
          controller: 'UpcomingController as upcomingVm'
        })
        .state('myPolls.collections', {
          templateUrl: 'app/my-polls/collections/collections.html',
          //controller: 'CollectionsController as vm'
        })
        .state('myPolls.collections.viewCollection', {
          url: '/my-polls/collection/:collectionId',
          templateUrl: 'app/my-polls/collections/view-collection.html',
          controller: 'ViewCollectionController as vm'
        })
        .state('myPolls.collections.viewCollection.editCollection', {
          params: { collection: { type: Object }},
          onEnter: [
            '$rootScope',
            '$stateParams',
            '$mdDialog',
            function($rootScope, $stateParams, $mdDialog) {
              $mdDialog.show({
                templateUrl: 'app/my-polls/collections/edit-collection.html',
                controller: 'EditCollectionController as vm',
                locals: { collection: $stateParams.collection }
              }).finally(function() {
                $rootScope.goToPreviousState();
              });
            }
          ]
        })
        .state('myPolls.collections.viewCollection.addGroup', {
          params: { collection: { type: Object }},
          onEnter: [
            '$rootScope',
            '$stateParams',
            '$mdDialog',
            function($rootScope, $stateParams, $mdDialog) {
              $mdDialog.show({
                templateUrl: 'app/my-polls/collections/add-group.html',
                controller: 'AddGroupController as vm',
                locals: { collection: $stateParams.collection }
              }).finally(function() {
                $rootScope.goToPreviousState();
              });
            }
          ]
        })
        .state('myPolls.collections.viewCollection.editGroup', {
          params: { group: { type: Object }},
          onEnter: [
            '$rootScope',
            '$stateParams',
            '$mdDialog',
            function($rootScope, $stateParams, $mdDialog) {
              $mdDialog.show({
                templateUrl: 'app/my-polls/collections/edit-group.html',
                controller: 'EditGroupController as vm',
                locals: { group: $stateParams.group }
              }).finally(function() {
                $rootScope.goToPreviousState();
              });
            }
          ]
        })
        .state('myPolls.collections.viewCollection.exportResult', {
          params: { group: { type: Object }},
          onEnter: [
            '$rootScope',
            '$stateParams',
            '$mdDialog',
            function($rootScope, $stateParams, $mdDialog) {
              $mdDialog.show({
                templateUrl: 'app/my-polls/collections/export-result.html',
                controller: 'ExportResultController as vm',
                locals: { group: $stateParams.group }
              }).finally(function() {
                $rootScope.goToPreviousState();
              });
            }
          ]
        })
        .state('myPolls.collections.editPolls', {
          url: '/my-polls/collection/:collectionId/:groupId/edit',
          templateUrl: 'app/my-polls/collections/edit-polls.html',
          controller: 'EditPollsController as vm'
        })
        .state('myPolls.collections.editPolls.addPoll', {
          params: { group: { type: Object } },
          onEnter: [
            '$rootScope',
            '$state',
            '$stateParams',
            '$mdDialog',
            function($rootScope, $state, $stateParams, $mdDialog) {
              $mdDialog.show({
                templateUrl: 'app/my-polls/collections/add-poll.html',
                controller: 'AddPollController as vm',
                locals: { group: $stateParams.group }
              }).then(function() {
                $state.go('myPolls.collections.editPolls', $stateParams);
              }).catch(function() {
                $rootScope.goToPreviousState();
              });
            }
          ]
        })
        .state('myPolls.trash', {
          url: '/my-polls/trash',
          templateUrl: 'app/my-polls/trash/trash.html',
          controller: 'TrashController as vm'
        })
    }
  
})();