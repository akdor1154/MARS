var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , crypto = require('crypto')
  , Promise = require('bluebird')
  , _ = require('underscore')
  , errors = require('../utils/errors')
  , log = require('../utils/log');
  
var pollCollectionSchema = new Schema({
	name: String,
  created: { type: Date, default: Date.now },
  deleted: Date,
  token: { type: String, index: true },
  owners: [{ type: Schema.Types.ObjectId, ref: 'User', index: true }],
  groups: [{ type: Schema.Types.ObjectId, ref: 'PollGroup' }],
}, {collection: 'pollCollections'});
pollCollectionSchema.set('toObject', { retainKeyOrder: true });


var updateOmittedFields = ['_id'];


pollCollectionSchema.statics.create = function(fields) {
  var User = mongoose.model('User');
  if (!fields.token)
    fields.token = _generateToken();
  return new PollCollection(fields)
    .save()
    .then(function(collection) {
      return collection.addToOwnersSubscriptions();
    });
}

pollCollectionSchema.statics.cascadeDelete = function(id, date) {
  date = date || new Date();
  var PollGroup = mongoose.model('PollGroup');
  return PollGroup.update(
    { pollCollection: id },
    { deleted: date },
    { multi: true }
  ).exec().return();
}

pollCollectionSchema.statics.ownerFindById = function(ownerId, id, projection, options) {
  if (_.isString(projection))
    projection += ' owners';
  if (_.isObject(projection))
    projection.owners = 1;
  return PollCollection.findById(id, projection, options)
    .exec()
    .then(function(collection) {
      if (!collection)
        return Promise.reject(errors.notFound('PollCollection', id));
      if (!collection.hasOwner(ownerId))
        return Promise.reject(errors.forbidden());
      return collection;
    });
}

pollCollectionSchema.statics.ownerFindByIdAndUpdate = function(ownerId, id, update, options) {
  var collection;
  return PollCollection.findOneAndUpdate(
    { _id: id, owners: ownerId },
    _.omit(update, updateOmittedFields),
    options || { new: true }
  )
    .exec()
    .then(function(updatedCollection) {
      if (!updatedCollection)
        return Promise.reject(errors.forbidden());
      collection = updatedCollection;
      if (update.deleted)
        return PollCollection.cascadeDelete(id, update.deleted);
    }).return(collection);
}

pollCollectionSchema.statics.ownerList = function(ownerId) {
  var Poll = mongoose.model('Poll');
  return PollCollection.find({ owners: ownerId })
    .sort('name')
    .populate({
      path: 'groups',
      populate: { path: 'polls', model: Poll }
    })
    .exec();
}

pollCollectionSchema.statics.ownerRemoveById = function(ownerId, id) {
  var PollGroup = mongoose.model('PollGroup'),
      Poll = mongoose.model('Poll');
  return PollCollection.ownerFindById(ownerId, id, {})
    .then(function(collection) {
      return Promise.all([
        collection.remove(),
        PollGroup.remove({ pollCollection: collection._id }),
        Poll.remove({ pollCollection: collection._id })
      ]);
    })
    .return();
}

pollCollectionSchema.statics.ownerUpdateById = function(ownerId, id, update, options) {
  return PollCollection.update(
    { _id: id, owners: ownerId },
    _.omit(update, updateOmittedFields),
    options
  )
    .exec()
    .then(function(output) {
      if (!output.n)
        return Promise.reject(errors.forbidden());
      if (update.deleted)
        return PollCollection.cascadeDelete(id, update.deleted);
    });
}

pollCollectionSchema.statics.pollerCreate = function(ownerId, fields) {
  var User = mongoose.model('User');
  return User.findById(ownerId)
    .select('group')
    .exec()
    .then(function(user) {
      if (!user)
        return Promise.reject(errors.notFound('User', ownerId));
      if (user.group !== 'poller')
        return Promise.reject(errors.forbidden());
      if (!_.isArray(fields.owners))
        fields.owners = [];
      fields.owners.push(ownerId);
      return PollCollection.create(fields);
    });
}


pollCollectionSchema.methods.hasGroup = function(groupId) {
  var collection = this;
  return _.some(collection.groups, function(group) {
    return group.toString() === groupId;
  });
}

pollCollectionSchema.methods.hasOwner = function(userId) {
  var collection = this;
  return _.some(collection.owners, function(owner) {
    return owner.toString() === userId;
  });
}

pollCollectionSchema.methods.addToOwnersSubscriptions = function() {
  var User = mongoose.model('User'),
      collection = this;
  return User.update(
    { _id: collection.owners }, 
    { $addToSet: { subscriptions: collection._id } },
    { multi: true }
  ).exec().return(collection);
}

pollCollectionSchema.methods.removeFromOwnersSubscriptions = function() {
  var User = mongoose.model('User'),
      collection = this;
  return User.update(
    { _id: collection.owners }, 
    { $pull: { subscriptions: collection._id } },
    { multi: true }
  ).exec().return(collection);
}


function _generateToken() {
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    , len = chars.length
    , bytes = crypto.randomBytes(6)
    , buffer = new Array(bytes.length);
  
  for (var i = 0; i < bytes.length; i++)
    buffer[i] = chars[bytes[i] % len];
  
  return buffer.join('');  
}


var PollCollection = mongoose.model('PollCollection', pollCollectionSchema);

module.exports = PollCollection;
