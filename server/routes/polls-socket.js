var mongoose = require('mongoose'),
    mongooseUtils = require('../utils/mongoose-utils'),
    log = require('../utils/log'),
    errors = require('../utils/errors');
    Promise = require('bluebird'),
    _ = require('underscore');

module.exports = function(
    io, 
    Poll, 
    PollCollection, 
    PollGroup,
    Result, 
    User
  ) {
    
	io.on('connection', function(socket) {
		log.trace('Socket: connection [%s]', socket.id);
    
/**
 * Collection of activations created by this socket
 *
 * These are tracked so that they can be deactivated when the socket is disconnected.
 */
    var activeResults = [];
   
/**
 * Join a room for each subscription
 *
 */
    User.getSubscriptions(socket.request.user)
      .then(function(subscriptions) {
        subscriptions.forEach(function(s) {
          var room = s.toString();
          socket.join(room);
          log.debug('User %s joined room %s', socket.request.user, room);
        });
      });
      
/**
 * Create a new collection
 *
 */
    socket.on('collection create', function(data) {
      log.trace('Socket: collection create', data);
      PollCollection.pollerCreate(socket.request.user, data)
        .then(function(collection) {
          log.info('Created collection', collection._id.toString());
          log.debug(collection);
          var responseData;
          if (data._response === 'created')
            responseData = collection;
          socket.join(collection._id.toString());
          log.info(
            'User %s joined room %s', 
            socket.request.user, 
            collection._id.toString()
          );
          socket.emit('collection create', responseData);
        })
        .catch(function(err) {
          respondWithError('collection create', err);
        });
    });
    
/**
 * Delete a collection
 *
 */
    socket.on('collection delete', function(data) {
      log.trace('Socket: collection delete', data);
      confirmHasFields(data, '_id')
        .then(function() {
          return PollCollection.ownerRemoveById(socket.request.user, data._id);
        })
        .then(function() {
          log.info('Deleted collection', data._id);
          socket.emit('collection delete');
        })
        .catch(function(err) {
          respondWithError('collection delete', err);
        });
    });
   
/**
 * List all collections owned by the logged in user
 *
 */
    socket.on('collection list', function(data) {
      log.trace('Socket: collection list', data);
      PollCollection.ownerList(socket.request.user)
        .then(function(collections) {
          socket.emit('collection list', collections);
        })
        .catch(function(err) {
          respondWithError('collection list', err);
        });
    });
    
/**
 * Subscribe the logged in user to a collection
 *
 */
    socket.on('collection subscribe', function(data) {
      log.trace('Socket: collection subscribe', data);
      User.subscribeToCollection(socket.request.user, data)
        .then(function(collectionId) {
          log.info(
            'User %s subscribed to %s', 
            socket.request.user, 
            collectionId.toString()
          );
          socket.join(collectionId.toString());
          log.info(
            'User %s joined room %s', 
            socket.request.user, 
            collectionId.toString()
          );
          socket.emit('collection subscribe');
        })
        .catch(function(err) {
          respondWithError('collection subscribe', err);
        });
    });
    
/**
 * Update a collection
 *
 */
    socket.on('collection update', function(data) {
      log.trace('Socket: collection update', data);
      confirmHasFields(data, '_id')
        .then(function() {
          var ownerId = socket.request.user;
          return (data._response === 'updated')
            ? PollCollection.ownerFindByIdAndUpdate(ownerId, data._id, data)
            : PollCollection.ownerUpdateById(ownerId, data._id, data);
        })
        .then(function(collection) {
          log.info('PollCollection updated', data._id);
          log.debug(collection);
          socket.emit('collection update', collection);
        })
        .catch(function(err) {
          respondWithError('collection update', err);
        });
    });
   
   
/**
 * Create a new group
 *
 */
    socket.on('group create', function(data) {
      log.trace('Socket: group create', data);
      PollGroup.ownerCreate(socket.request.user, data)
        .then(function(group) {
          log.info('Created group', group._id.toString());
          log.debug(group);
          var responseData;
          if (data._response === 'created')
            responseData = group;
          socket.emit('group create', responseData);
        })
        .catch(function(err) {
          respondWithError('group create', err);
        });
    });
    
/**
 * Delete a group
 *
 */
    socket.on('group delete', function(data) {
      log.trace('Socket: group delete', data);
      confirmHasFields(data, '_id')
        .then(function() {
          return PollGroup.ownerRemoveById(socket.request.user, data._id);
        })
        .then(function() {
          log.info('Deleted group', data._id);
          socket.emit('group delete');
        })
        .catch(function(err) {
          respondWithError('group delete', err);
        });
    });
   
/**
 * Update a group
 * 
 */
    socket.on('group update', function(data) {
      log.trace('Socket: group update', data);
      confirmHasFields(data, '_id')
        .then(function() {
          var ownerId = socket.request.user;
          return (data._response === 'updated')
            ? PollGroup.ownerFindByIdAndUpdate(ownerId, data._id, data)
            : PollGroup.ownerUpdateById(ownerId, data._id, data);
        })
        .then(function(group) {
          log.info('PollGroup updated', data._id);
          log.debug(group);
          socket.emit('group update', group);
        })
        .catch(function(err) {
          respondWithError('group update', err);
        });
    });
    
/**
 * Retrieve a poll by id
 *
 */
		socket.on('poll', function(data) {
			log.trace('Socket: poll', data);
      confirmHasFields(data, '_id')
        .then(function() {
          return Poll.findById(data._id)
            .exec()
        })
				.then(function(poll) {
					socket.emit('poll', poll);
				})
        .catch(function(err) {
          respondWithError('poll', err);
        });
		});
		
/**
 * Activate a poll
 *
 */
		socket.on('poll activate', function(data) {
			log.trace('Socket: poll activate', data);
      Poll.activate(data._id)
        .then(function(result) {
          log.info('Poll activated', data._id)
          log.debug(result);
          activeResults.push(result._id);
          socket.to(result.pollCollection._id.toString())
            .emit('poll activate', _.pick(result, '_id', 'poll'));
          log.debug('Sent to room: ' + result.pollCollection._id.toString());
          socket.emit('poll activate', _.pick(result, '_id'));
        })
        .then(null, function(err) {
          respondWithError('poll activate', err);
        });
		});
    
/**
 * Create a new poll
 *
 */
    socket.on('poll create', function(data) {
      log.trace('Socket: poll create', data);
      Poll.ownerCreate(socket.request.user, data)
        .then(function(poll) {
          log.info('Created poll', poll._id.toString());
          log.debug(poll);
          var responseData;
          if (data._response === 'created')
            responseData = poll;
          socket.emit('poll create', responseData);
        })
        .catch(function(err) {
          respondWithError('group create', err);
        });
    });
    
/**
 * Delete a poll
 *
 */
    socket.on('poll delete', function(data) {
      log.trace('Socket: poll delete', data);
      confirmHasFields(data, '_id')
        .then(function() {
          return Poll.ownerRemoveById(socket.request.user, data._id);
        })
        .then(function() {
          log.info('Deleted poll', data._id);
          socket.emit('poll delete');
        })
        .catch(function(err) {
          respondWithError('poll delete', err);
        });
    });
    
/**
 * List all activations for a poll
 *
 */
    socket.on('poll list activations', function(data) {
      log.trace('Socket: poll list activations', data);
      confirmHasFields(data, '_id')
        .then(function() {
          return Poll.getActivations(data._id)
        })
        .then(function(activations) {
          socket.emit('poll list activations', activations);
        })
        .catch(function(err) {
          respondWithError('poll list activations', err);
        });
    });
    
/**
 * List all active polls that the user is subscribed to
 *
 * Polls are listed in the order in which they were activated.
 */
		socket.on('poll list active', function() {
			log.trace('Socket: poll list active');
      User.getSubscriptions(socket.request.user)
        .then(function(subscriptions) {
          return Result.find({ active: true })
            .where('pollCollection').in(subscriptions)
            .select({ poll: 1 })
            .populate('poll')
            .exec();
        })
        .then(function(results) {
          socket.emit('poll list active', results);
        })
        .catch(function(err) {
          respondWithError('poll list active', err);
        });
		});

/**
 * List all results for a poll
 *
 */
    socket.on('poll list results', function(data) {
      log.trace('Socket: poll list results');
      Poll.getResults(data._id)
        .then(function(results) {
          socket.emit('poll list results', results);
        })
        .catch(function(err) {
          respondWithError('poll list results', err);
        });
    });    

        
/**
 * Update a poll
 *
 */
    socket.on('poll update', function(data) {
      log.trace('Socket: poll update', data);
      confirmHasFields(data, '_id')
        .then(function() {
          var ownerId = socket.request.user;
          return (data._response === 'updated')
            ? Poll.ownerFindByIdAndUpdate(ownerId, data._id, data)
            : Poll.ownerUpdateById(ownerId, data._id, data);
        })
        .then(function(poll) {
          log.info('Poll updated', data._id);
          log.debug(poll);
          socket.emit('poll update', poll);
        })
        .catch(function(err) {
          respondWithError('poll update', err);
        });
    });
    
/**
 * Handle a response to a poll
 *
 */
    socket.on('response', function(data) {
      log.trace('Socket: response', data);
      confirmHasFields(data, '_id')
        .then(function() {
          var response = {
            user: socket.request.user,
            data: data.response
          };
          return Result.saveResponse(data._id, response);
        })
        .then(function(response) {
          response._id = data._id;
          socket.to(data._id).emit('response', response);
        })
        .catch(function(err) {
          respondWithError('response', err);
        });
    });
    
/**
 * Retrieve a result by ID
 *
 */
    socket.on('result', function(data) {
      log.trace('Socket: result');
      Result.findById(data._id)
        .populate('poll')
        .populate('responses.user', 'username')
        .exec()
        .then(function(result) {
          socket.emit('result', result);
        });
    });
    
/**
 * Deactivate a result
 *
 */
    socket.on('result deactivate', function(data) {
      log.trace('Socket: result deactivate');
      Result.deactivate(data._id)
        .then(function(deactivatedResult) {
          log.info('Deactivated result: ', deactivatedResult._id);
          socket.to(deactivatedResult.pollCollection.toString())
            .emit('result deactivate', _.pick(deactivatedResult, '_id'));
        })
        .then(null, function(err) {
          respondWithError('result deactivate', err);
        });
    });
    
/**
 * Resume a result
 *
 */
    socket.on('result resume', function(data) {
      log.trace('Socket: result resume');
      confirmHasFields(data, '_id')
        .then(function() {
          if (_.has(data, 'from'))
            return Result.deactivate(data.from)
        })
        .then(function(deactivatedResult) {
          if (deactivatedResult) {
            log.info('Deactivated result: ', deactivatedResult._id);
            socket.to(deactivatedResult.pollCollection.toString())
              .emit('result deactivate', _.pick(deactivatedResult, '_id'));
          }
          return Result.resume(data._id, data.from)
        })
        .then(function(result) {
          log.info('Result activated: ' + data._id)
          log.debug(result);
          activeResults.push(result._id);
          socket.to(result.pollCollection.toString())
            .emit('result resume', _.pick(result, '_id', 'activations', 'poll'));
          socket.emit('result resume', _.pick(result, '_id'));
        })
        .then(null, function(err) {
          respondWithError('result resume', err);
        });
    });
    
/**
 * Register a result viewer
 *
 */
    socket.on('result viewer', function(data) {
      log.trace('Socket: result viewer');
      confirmHasFields(data, '_id')
        .then(function() {
          return Result.findById(data._id)
          .populate('poll')
          .populate('pollCollection', 'owners')
          .exec()
        })
        .then(function(result) {
          if (!result)
            throw new errors.notFound('Result', data._id);
          socket.join(result._id.toString());
          socket.emit('result viewer', result);
        })
        .then(null, function(err) {
          respondWithError('result viewer', err);
        });
    });
		
/**
 * Client disconnected
 *
 */
    socket.on('disconnect', function() {
      log.trace('Socket: disconnect');
      // Check whether the client was the activator of any rooms
      activeResults.forEach(function(resultId) {
        log.debug('Deactivating: ', resultId);
        Result.deactivate(resultId)
          .then(function(result) {
            log.info('Deactivated result: ', result._id);
            socket.to(result.pollCollection.toString())
              .emit('result deactivate', _.pick(result, '_id'));
          });
      });
    });
    
/**
 * Create a promise that will be fulfilled if an object has all fields
 *
 */
    function confirmHasFields(obj, fields) {
      if (_.isString(fields)) {
        return _.has(obj, fields)
          ? Promise.resolve()
          : Promise.reject(errors.missingFields(fields));
      }
      if (!_.isArray(fields)) {
        return Promise.reject(
          errors.argumentError('Fields should be an array or string')
        );
      }
      var missingFields = [];
      fields.forEach(function(field) {
        if (!_.has(obj, field))
          missingFields.push(field);
      });
      return (missingFields.length === 0)
        ? Promise.resolve()
        : Promise.reject(errors.missingFields(fields));
    }
    
/**
 * Check whether a user is logged in
 *
 */
    function isAuthenticated() {
      return socket.userId !== null;
    }
    
/**
 * Log an error and send it to the client
 *
 */
    function respondWithError(action, err) {
      if (err instanceof errors.MarsError)
        delete err.stack;
      log.error(err);
      if (!(err instanceof errors.MarsError))
        err = errors.internal(err);
      if (action)
        socket.emit(action, { error: _.pick(err, 'code', 'message') });
    }
    		
	});
}