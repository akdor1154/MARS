mars.controller('MyPollsCollectionController', ['$scope', '$log', '$state', '$stateParams', '$mdDialog', 'MyPollsService', function($scope, $log, $state, $stateParams, $mdDialog, MyPollsService) {
  
  $scope.layout.menu = [
    { label: 'Delete Collection', click: deleteCollection },
    { label: 'Rename Collection (TODO)', click: null }
  ];
  $scope.layout.search = true;
  $scope.$on('$destroy', function() { 
    $scope.layout.menu = null;
    $scope.layout.search = null;
  });
  
  
  $scope.activatePoll = function(poll) {
    MyPollsService.activatePoll(poll).then(
      function(activation) {
        $log.info('Poll activated', activation);
        $state.go('result', { activationId: activation._id });
      }
    );
	}
  
  $scope.$watch('collections', function(newValue, oldValue) {
    try {
        selectCollection($stateParams.collectionId);
    }
    catch (err) 
    { $log.warn(err); }
  });
  
  // Jump to myPolls.collection.view if arriving here directly (by URL)
  if ($state.current.name.indexOf('.collection', $state.current.name.length - 11) !== -1)
    $state.go('myPolls.collection.view');
  
  function deleteCollection() {
    var collection = $scope.selectedCollection;
    var confirm = $mdDialog.confirm()
      .title('Delete Collection')
      .content('Are you sure you would like to delete the collection "' + collection.name + '" ?')
      .ok('Yes')
      .cancel('No');
    $mdDialog.show(confirm).then(
      function() {
        var removeIndex = -1;
        for(var i = 0; i < $scope.collections.length; i++) {
          if ($scope.collections[i]._id === collection._id) {
            removeIndex = i;
            break;
          }
        }
        if (removeIndex < 0)
          return;
        $scope.selectedCollection = null;
        $scope.collections.splice(removeIndex, 1);
        MyPollsService.deleteCollection(collection).then(
          function() {
            $log.info('Deleted collection: ' + collection._id);
          },
          $log.error
        );
        $state.go('myPolls.upcoming');
      }
    );
  }
  
  function renameCollection() {
    
  }
  
  function selectCollection(collectionId) {
    if (!angular.isArray($scope.collections)) 
      throw new Error('Could not select collection, $scope.collections is not an array');
    $scope.collections.forEach(function(collection) {
      if (collection._id === collectionId) {
        $scope.selectedCollection = collection;
        $scope.layout.title = collection.name;
        $log.info('Selected collection: ', collectionId);
      }
    });
  }
    
}]);