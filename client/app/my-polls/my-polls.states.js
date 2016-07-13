(function() {
  'use strict';
  
  angular
    .module('app.myPolls')
    .config(statesConfig);
      
    statesConfig.$inject = ['$stateProvider'];
    
    function statesConfig($stateProvider) {
      $stateProvider
        .state('myPolls', {
          url: '/my-polls',
          templateUrl: 'app/my-polls/shell/shell.html',
          controller: 'ShellController as vm'
        })
        .state('myPolls.upcoming', {
          url: '/upcoming',
          templateUrl: 'app/my-polls/upcoming/upcoming.html',
          controller: 'UpcomingController as upcomingVm'
        })
        .state('myPolls.collections', {
          url: '/collection',
          template: '<ui-view class="max-width-960"/>'
        })
        .state('myPolls.collections.viewCollection', {
          url: '/:collectionId',
          templateUrl: 'app/my-polls/collections/view-collection.html',
          controller: 'ViewCollectionController as vm'
        })
        .state('myPolls.collections.viewCollection.cloneCollection', {
          params: { collection: { type: Object }},
          onEnter: [
            '$rootScope',
            '$stateParams',
            '$mdDialog',
            function($rootScope, $stateParams, $mdDialog) {
              $mdDialog.show({
                templateUrl: 'app/my-polls/collections/clone-collection.html',
                controller: 'CloneCollectionController as vm',
                locals: { collection: $stateParams.collection }
              }).finally(function() {
                $rootScope.goToPreviousState();
              });
            }
          ]
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
        .state('myPolls.collections.viewCollection.exportResults', {
          params: { groups: { type: Object }},
          onEnter: [
            '$rootScope',
            '$stateParams',
            '$mdDialog',
            function($rootScope, $stateParams, $mdDialog) {
              $mdDialog.show({
                templateUrl: 'app/my-polls/collections/export-results.html',
                controller: 'ExportResultsController as vm',
                locals: { groups: $stateParams.groups }
              }).finally(function() {
                $rootScope.goToPreviousState();
              });
            }
          ]
        })
        .state('myPolls.collections.editPolls', {
          url: '/:collectionId/:groupId/edit',
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
        .state('myPolls.collections.leaderboard', {
          url: '/:collectionId/leaderboard',
          templateUrl: 'app/my-polls/collections/leaderboard.html',
          controller: 'LeaderboardController as vm'
        })
        .state('myPolls.archive', {
          url: '/archive',
          templateUrl: 'app/my-polls/archive/archive.html',
          controller: 'ArchiveController as vm'
        })
        .state('myPolls.archive.exportResults', {
          params: { groups: { type: Object }},
          onEnter: [
            '$rootScope',
            '$stateParams',
            '$mdDialog',
            function($rootScope, $stateParams, $mdDialog) {
              $mdDialog.show({
                // It's no longer only a collection template.
                // Move to 'app/my-polls/common/' ?
                templateUrl: 'app/my-polls/collections/export-results.html',
                controller: 'ExportResultsController as vm',
                locals: { groups: $stateParams.groups }
              }).finally(function() {
                $rootScope.goToPreviousState();
              });
            }
          ]
        })
        .state('myPolls.trash', {
          url: '/trash',
          templateUrl: 'app/my-polls/trash/trash.html',
          controller: 'TrashController as vm'
        })
        .state('myPolls.help', {
          url: '/help',
          template: '<ui-view class="max-width-960" />',
        })
        .state('myPolls.help.default', {
          templateUrl: 'app/my-polls/help/help.html',
          controller: 'HelpController as vm',
        })
        .state('myPolls.help.gettingStarted', {
          url: '/getting-started',
          templateUrl: 'app/my-polls/help/getting-started.html',
          controller: 'GettingStartedController as vm',
        })
    }
  
})();