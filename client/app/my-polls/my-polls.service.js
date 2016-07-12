(function() {
  'use strict';
  
  angular
    .module('app.myPolls')
    .factory('myPollsService', myPollsService);
      
  myPollsService.$inject = ['$log', '$q', 'marsService'];
  
  function myPollsService($log, $q, marsService) {
    $log = $log.getInstance('myPollsService');
    
    var collections = [];
    var _getCollectionsPromise = null;
    var _hasLoadedCollections = false;
    
    return {
      activatePoll: activatePoll,
      cascadeOwners: cascadeOwners,
      cloneCollection: cloneCollection,
      createCollection: createCollection,
      createGroup: createGroup,
      createPoll: createPoll,
      createResult: createResult,
      deleteCollection: deleteCollection,
      deleteGroup: deleteGroup,
      deletePoll: deletePoll,
      getCollection: getCollection,
      getCollections: getCollections,
      getGroup: getGroup,
      getGroups: getGroups,
      getLastResult: getLastResult,
      getPollResults: getPollResults,
      getResult: getResult,
      getResults: getResults,
      groupIndex: groupIndex,
      listResults: listResults,
      listSubscribers: listSubscribers,
      pollIndex: pollIndex,
      restoreCollection: restoreCollection,
      restoreGroup: restoreGroup,
      restorePoll: restorePoll,
      searchGroups: searchGroups,
      searchUsers: searchUsers,
      swapGroups: swapGroups,
      swapPolls: swapPolls,
      updateCollection: updateCollection,
      updateGroup: updateGroup,
      updatePoll: updatePoll
    };
    
/**
 * Activate a poll
 *
 */
    function activatePoll(poll) {
      return marsService.request('poll activate', {
        _id: poll._id
      });
    }
    
/** 
 * Cascades a collection's owners array down to all groups and polls within
 * the collection
 *
 */
    function cascadeOwners(collection) {
      if (!angular.isArray(collection.groups))
        return;
      collection.groups.forEach(function(group) {
        group.owners = collection.owners;
        if (!angular.isArray(group.polls))
          return;
        group.polls.forEach(function(poll) {
          poll.owners = group.owners;
        });
      });
    }
    
/**
 * Clone an existing collection
 *
 */
    function cloneCollection(collection, archive, newCollection) {
      var data = {
        _id: marsService.id(collection),
        archive: archive || false,
        newCollection: newCollection
      }
      return marsService.request('collection clone', data)
        .then(function(newCollection) {
          newCollection = _reviveCollection(newCollection);
          $log.debug('newCollection = ', newCollection);
          collections.splice(
            _.sortedIndex(collections, newCollection, 'name'),
            0,
            newCollection
          );
          if (archive === true)
            collection.archive = new Date();
          return newCollection;
        });
    }
    
/**
 * Create a new poll collection
 *
 */
    function createCollection(collection) {
      marsService.depopulate(collection, 'groups');
      collection._response = 'created';
      $log.debug('collection = ', collection);
      return marsService.request('collection create', collection)
        .then(function(createdCollection) {
          createdCollection = _reviveCollection(createdCollection);
          $log.debug('createdCollection = ', createdCollection);
          collections.push(createdCollection);
          return createdCollection;
        });
    }
  
/**
 * Create a new group within a collection
 *
 */
    function createGroup(group) {
      var collection = group.pollCollection;
      marsService.depopulate(group, ['pollCollection', 'polls']);
      group._response = 'created';
      $log.debug('group = ', group);
      return marsService.request('group create', group)
        .then(function(createdGroup) {
          createdGroup.collection = collection;
          createdGroup = _reviveGroup(createdGroup);
          $log.debug('createdGroup = ', createdGroup);
          createdGroup.collection.groups.push(createdGroup);
          return createdGroup;
        });
    }
    
    
/**
 * Create a result for a poll
 *
 */
    function createResult(poll) {
      return marsService.request('result create', { _id: poll._id });
    }
  
/**
 * Create a new poll within a group
 *
 */
    function createPoll(poll) {
      var group = poll.group;
      marsService.depopulate(poll, ['group', 'pollCollection']);
      poll._response = 'created';
      return marsService.request('poll create', poll)
        .then(function(poll) {
          group.polls.push(poll);
          _revivePoll(poll, group);
          return poll;
        });
    }
  
/**
 * Deactivate a poll
 *
 */
    function deactivatePoll(activationId) {
      return marsService.request('poll deactivate', {
        _id: activationId
      });
    }
    
/**
 * Delete a collection
 * 
 * The default behavior is to flag the collection as deleted.
 * If destroy is true, the collection will be deleted from the database.
 *
 * When a collection is deleted, all groups that belong to it are 
 * also deleted.
 */
    function deleteCollection(collection, destroy) {
      if (!destroy) {
        collection.deleted = new Date();
        // Cascade delete
        collection.groups.forEach(function(group) {
          group.deleted = collection.deleted;
        });
        return updateCollection(collection, 'deleted');
      }
      else {
        return marsService.request('collection delete', { _id: collection._id })
          .then(function() {
            var index = _.findIndex(collections, function(c) {
              return c._id === collection._id;
            });
            collections.splice(index, 1);
            $log.info('Deleted collection: ' + collection._id);
          });
      }
    }
    
/**
 * Delete a group
 *
 * The default behavior is to flag the poll as deleted.
 * If destroy is true, the poll will be deleted from the database.
 */
    function deleteGroup(group, destroy) {
      if (!destroy) {
        group.deleted = new Date();
        return updateGroup(group, 'deleted');
      }
      else {
        return marsService.request('group delete', { _id: group._id })
          .then(function() {
            group.collection.groups.splice(groupIndex(group), 1);
            $log.info('Deleted group: ' + group._id);
          }); 
      }
    }
    
/**
 * Delete a poll
 *
 * The default behavior is to flag the poll as deleted.
 * If destroy is true, the poll will be deleted from the database.
 */
    function deletePoll(poll, destroy) {
      if (!destroy) {
        poll.deleted = new Date();
        return updatePoll(poll, 'deleted');
      }
      else {
        return marsService.request('poll delete', { _id: poll._id })
          .then(function() {
            poll.group.polls.splice(pollIndex(poll), 1);
            $log.info('Deleted poll: ' + poll._id);
          });
      }
    };
   
/**
 * Get a collection with the specified ID
 *
 */
    function getCollection(collectionId) {
      return getCollections().then(function(collections) {
        var collection = _.find(collections, function(collection) {
          return collection._id === collectionId;
        });
        if (!collection)
          $q.reject('Collection not found: ', collectionId);
        return collection;
      });
    }
   
/**
 * Get all collections for the current user
 *
 */
    function getCollections(forceLoad) {
      if (_hasLoadedCollections && !forceLoad) {
        return $q.resolve(collections);
      }
      if (_getCollectionsPromise)
        return _getCollectionsPromise;
      _hasLoadedCollections = false;
      _getCollectionsPromise = marsService.request('collection list').then(
        function(collectionsList) {
          angular.copy(
            collectionsList.map(_reviveCollection),
            collections
          );
          _hasLoadedCollections = true;
          _getCollectionsPromise = null;
          return collections;
        }
      );
      return _getCollectionsPromise;
    }
  
/**
 * Get a group with the specified ID
 *
 */
    function getGroup(collectionId, groupId) {
      return getCollection(collectionId).then(function(collection) {
        var group = _.find(collection.groups, function(group) {
          return group._id === groupId;
        });
        if (!group)
          $q.reject('Group not found: ', groupId);
        return group;
      });
    }
  
/**
 * Get a flat array of groups from all collections
 *
 */
    function getGroups() {
      return getCollections().then(function(collections) {
        return _.flatten(_.pluck(collections, 'groups'));
      });
    } 
    
/**
 * Get the ID of the most recent result for a poll
 *
 */
    function getLastResult(poll) {
      return marsService.request('poll last result', { _id: poll._id });
    }
    
/**
 * Get a collection of results that belon to the polls with the specified IDs
 *
 */
    function getPollResults(pollIds) {
      return marsService.request('poll results', { _id: pollIds });
    }
    
/**
 * Get a result with the specified ID
 *
 */
    function getResult(resultId) {
      return marsService.request('result', { _id: resultId });
    }
    
/**
 * Get a collection of results that match the array of IDs
 *
 */
    function getResults(resultIds) {
      return marsService.request('results', { _id: resultIds });
    }
    
/**
 * Get the position of a group within its parent collection
 *
 */ 
    function groupIndex(group) {
      return _.findIndex(group.collection.groups, function(g) {
        return group._id === g._id;
      });
    }
    
/**
 * Get a list of activations for the poll with the specified ID
 *
 */
    function listResults(pollId) {
      return marsService.request('poll list results', { _id: pollId });
    }
    
/**
 * Get a list of subscribers for the collection with the specified ID
 *
 */
    function listSubscribers(collectionId) {
      return marsService.request(
        'collection list subscribers', 
        { _id: collectionId }
      );
    }
    
/**
 * Get the position of a poll within its parent group
 *
 */
    function pollIndex(poll) {
      return _.findIndex(poll.group.polls, function(p) {
        return poll._id === p._id;
      });
    }
    
    
/**
 * Restore a deleted collection.
 *
 */
    function restoreCollection(collection) {
      if (!angular.isDate(collection.deleted))
        return $q.resolve();
      collection.deleted = null;
      return updateCollection(collection, 'deleted');
    }
    
/**
 * Restore a deleted group
 *
 * If the collection the group belongs to is deleted, it will also be 
 * restored.
 */
    function restoreGroup(group) {
      if (!angular.isDate(group.deleted))
        return $q.resolve();
      group.deleted = null;
      return updateGroup(group, 'deleted').then(function() {
        return restoreCollection(group.collection);
      });
    }
    
/**
 * Restore a deleted poll
 *
 * If the group the poll belongs to is deleted, it will also be restored.
 */
    function restorePoll(poll) {
      if (!angular.isDate(poll.deleted))
        return $q.resolve();
      poll.deleted = null;
      return updatePoll(poll, 'deleted').then(function() {
        return restoreGroup(poll.group);
      });
    }
    
/**
 * Returns a filtered set of groups that contain the search phrase
 *
 */
    function searchGroups(groups, phrase) {
      if (!phrase)
        return groups;
      phrase = phrase.toLowerCase();
      return _.filter(groups, function(group) {
        var fullName = 
          (group.collection.name + ' - ' + group.name).toLowerCase();
        return fullName.indexOf(phrase) > -1
            || _.some(group.polls, function(poll) {
                 return poll.name 
                   && poll.name.toLowerCase().indexOf(phrase) > -1;
               });
      });
    }
    
/** 
 * Returns a list of users that match the search phrase
 *
 */
  function searchUsers(phrase, group) {
    if (!phrase || phrase.length < 3)
      return;
    var data = { phrase: phrase };
    group && (data.group = group);
    return marsService.request('user search', data);
  }
    
/**
 * Swap the collection and position of two groups
 *
 */ 
    function swapGroups(group1, group2) {
      var group1Index = groupIndex(group1),
          group2Index = groupIndex(group2),
          group1Collection = group1.collection;
      group1.collection.groups[group1Index] = group2;
      group2.collection.groups[group2Index] = group1;
      group1.collection = group2.collection;
      group2.collection = group1Collection;
      return updateCollection(group1.collection, 'groups')
        .then(function() {
          if (group1.collection._id !== group2.collection._id)
            return updateCollection(group2.collection, 'groups');
        });
    }
    
/**
 * Swap the group and position of two polls
 *
 */
    function swapPolls(poll1, poll2) {
      var poll1Index = pollIndex(poll1),
          poll2Index = pollIndex(poll2),
          poll1Group = poll1.group;
      poll1.group.polls[poll1Index] = _revivePoll(poll2, poll2.group);
      poll2.group.polls[poll2Index] = _revivePoll(poll1, poll1.group);
      return updateGroup(poll1.group, 'polls')
        .then(function() {
          if (poll1.group._id !== poll2.group._id)
            return updateGroup(poll2.group, 'polls');
        });
    }
    
    
    function updateCollection(collection, keys, response) {
      var collectionCopy = marsService.clone(collection, keys);
      marsService.depopulate(collectionCopy, ['groups', 'owners']);
      
      if (response)
        collectionCopy._response = (response === true ? 'updated' : response);
      
      return marsService.request('collection update', collectionCopy)
        .then(function(updatedCollection) {
          $log.info('Updated collection: ' + collection._id);
          if (!updatedCollection)
            return;
          updatedCollection.groups = collection.groups;
          updatedCollection = _reviveCollection(updatedCollection);
          angular.copy(updatedCollection, collection);
          return collection;
        });
    }
    
    function updateGroup(group, keys, response) {
      var groupCopy = marsService.clone(group, keys);
      marsService.depopulate(groupCopy, ['owners', 'polls']);
      
      if (_.isObject(groupCopy.collection)) {
        groupCopy.pollCollection = group.collection._id;
        delete groupCopy.collection;
      }
      
      if (response)
        groupCopy._response = (response === true ? 'updated' : response);
      
      return marsService.request('group update', groupCopy)
        .then(function(updatedGroup) {
          $log.info('Updated group: ' + group._id);
          if (!updatedGroup)
            return;
          updatedGroup = _reviveGroup(updatedGroup);
          updatedGroup.collection = group.collection;
          angular.copy(updatedGroup, group);
          return group;
        });
    }
    
    function updatePoll(poll, keys, response) {
      var pollCopy = marsService.clone(poll, keys);
      marsService.depopulate(pollCopy, ['group', 'owners', 'pollCollection']);
      
      if (response)
        groupCopy._response = (response === true ? 'updated' : response);

      return marsService.request('poll update', pollCopy)
        .then(function(updatedPoll) {
          $log.info('Updated poll: ' + poll._id);
          if (!updatedPoll)
            return;
          updatedPoll = _revivePoll(updatedPoll, poll.group);
          angular.copy(updatedPoll, poll);
          return poll;
        }); 
    }
    
/**
 * Restore properties of a collection object altered by socket.io 
 * transmission to their correct values
 *
 */
    function _reviveCollection(collection) {
      if (angular.isString(collection.created))
        collection.created = new Date(collection.created);
      if (angular.isString(collection.deleted))
        collection.deleted = new Date(collection.deleted);
      if (angular.isString(collection.archived))
        collection.deleted = new Date(collection.archived);
      if (angular.isArray(collection.groups))
        collection.groups = collection.groups.map(function(group) {
          group.collection = collection;
          return _reviveGroup(group);
        });
      return collection;
    }
   
/**
 * Restore properties of a group object altered by socket.io transmission
 * to their correct values
 *
 */ 
    function _reviveGroup(group) {
      if (angular.isString(group.upcoming))
        group.upcoming = new Date(group.upcoming);
      if (angular.isString(group.deleted))
        group.deleted = new Date(group.deleted);
      if (group.collection)
        group.owners = group.collection.owners;
      if (angular.isArray(group.polls)) {
        group.polls = group.polls.map(function(poll) {
          return _revivePoll(poll, group);
        });
      }
      return group;
    }
    
/**
 * Restore properties of a poll object altered by socket.io transmission
 * to their correct values
 *
 */ 
    function _revivePoll(poll, group) {
      if (angular.isString(poll.deleted))
        poll.deleted = new Date(poll.deleted);
      poll.group = group;
      poll.pollCollection = group.pollCollection;
      poll.owners = group.owners;
      return poll;
    }
  
  }
  
})();