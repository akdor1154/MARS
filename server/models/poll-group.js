var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , Promise = require('bluebird')
  , _ = require('underscore')
  , errors = require('../utils/errors')
  , log = require('../utils/log');
  
var pollGroupSchema = new Schema({
  name: String,
  color: String,
  upcoming: Date,
  deleted: Date,
  pollCollection: { type: Schema.Types.ObjectId, ref: 'PollCollection', index: true },
  owners: [{ type: Schema.Types.ObjectId, ref: 'User', index: true }],
  polls: [{ type: Schema.Types.ObjectId, ref: 'Poll' }]
}, {collection: 'pollGroups'});
pollGroupSchema.set('toObject', { retainKeyOrder: true });


var updateOmittedFields = ['_id', 'pollCollection'];


pollGroupSchema.statics.create = function(fields) {
  return new PollGroup(fields).save()
    .then(function(group) {
      return group.addToCollection();
    });
}

pollGroupSchema.statics.ownerCreate = function(ownerId, fields) {
  var PollCollection = mongoose.model('PollCollection');
  if (!_.has(fields, 'pollCollection'))
    Promise.reject(errors.missingField('pollCollection'));
  return PollCollection.ownerFindById(ownerId, fields.pollCollection, {})
    .then(function(collection) {
      fields.owners = collection.owners;
      return PollGroup.create(fields);
    });
}

pollGroupSchema.statics.ownerFindById = function(ownerId, id, projection, options) {
  if (_.isString(projection))
    projection += ' owners';
  if (_.isObject(projection))
    projection.owners = 1;
  return PollGroup.findById(id, projection, options)
    .exec()
    .then(function(group) {
      if (!group)
        return Promise.reject(errors.notFound('PollGroup', id));
      if (!group.hasOwner(ownerId))
        return Promise.reject(errors.forbidden());
      return group;
    });
}

pollGroupSchema.statics.ownerFindByIdAndUpdate = function(ownerId, id, update, options) {
  return PollGroup.findOneAndUpdate(
    { _id: id, owners: ownerId },
    _.omit(update, updateOmittedFields),
    options || { new: true }
  )
    .exec()
    .then(function(group) {
      if (!group)
        return Promise.reject(errors.forbidden());
      return group;
    });
}

pollGroupSchema.statics.ownerRemoveById = function(ownerId, id) {
  var Poll = mongoose.model('Poll');
  return PollGroup.ownerFindById(ownerId, id, 'pollCollection')
    .then(function(group) {
      return Promise.all([
        group.remove(),
        group.removeFromCollection(),
        Poll.remove({ pollGroup: group._id })
      ]);
    })
    .return();
}

pollGroupSchema.statics.ownerUpdateById = function(ownerId, id, update, options) {
  return PollGroup.update(
    { _id: id, owners: ownerId },
    _.omit(update, updateOmittedFields),
    options
  )
    .exec()
    .then(function(output) {
      if (!output.n)
        return Promise.reject(errors.forbidden());
    }); 
}


pollGroupSchema.methods.hasOwner = function(userId) {
  var group = this;
  return _.some(group.owners, function(owner) {
    return owner.toString() === userId;
  });
}

pollGroupSchema.methods.addToCollection = function() {
  var PollCollection = mongoose.model('PollCollection'),
      group = this;
  return PollCollection.update(
    { _id: group.pollCollection }, 
    { $addToSet: { groups: group._id } }
  ).exec().return(group);
}

pollGroupSchema.methods.removeFromCollection = function() {
  var PollCollection = mongoose.model('PollCollection'),
      group = this;
  return PollCollection.update(
    { _id: group.pollCollection }, 
    { $pull: { groups: group._id } }
  ).exec().return(group);
}


var PollGroup = mongoose.model('PollGroup', pollGroupSchema);

module.exports = PollGroup;
