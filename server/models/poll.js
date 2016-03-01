var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , Promise = require('bluebird')
  , _ = require('underscore')
  , errors = require('../utils/errors')
  , log = require('../utils/log');

var pollSchema = new Schema({
	name: String,
	type: String,
  deleted: Date,
  pollCollection: { type: Schema.Types.ObjectId, ref: 'PollCollection', index: true },
	group: { type: Schema.Types.ObjectId, ref: 'PollGroup', index: true },
	data: {},
  owners: [{ type: Schema.Types.ObjectId, ref: 'User', index: true }],
  _isNew: Boolean
}, {collection: 'polls', minimize: false});
pollSchema.set('toObject', { retainKeyOrder: true });
pollSchema.set('toJSON', { minimize: false });

var updateOmittedFields = ['_id', 'group', 'pollCollection'];


pollSchema.statics.activate = function(pollId, userId) {
  var Result = mongoose.model('Result'),
      poll;
  return Result.findOne({
    'poll': pollId,
    'activations.user': userId,
    'activations.end': null
  }).populate('poll')
    .then(function(activeResult) {
      if (activeResult) {
        log.debug('Cached: ', activeResult);
        return { activeResult: activeResult }; }
      return Poll.findById(pollId)
        .populate('pollCollection', 'name token')
        .exec()
    })
    .then(function(p) {
      if (p.activeResult)
        return p;
      poll = p;
      return Result
        .createForPoll(poll)
        .activate(userId)
    })
    .then(function(p) {
      if (p.activeResult) {
        log.debug('Cached: ', p.activeResult);
        return p.activeResult; }
      var result = p;
      result.poll = poll;
      result.pollCollection = result.pollCollection._id;
      return result;
    });
}



pollSchema.statics.create = function(fields) {
  fields._isNew = true;
  return new Poll(fields).save()
    .then(function(poll) {
      return poll.addToGroup();
    });
}

pollSchema.statics.createResult = function(pollId) {
  var Result = mongoose.model('Result');
  return Poll.findById(pollId)
    .populate('pollCollection', 'token')
    .exec()
    .then(function(poll) {
      return Result.createForPoll(poll).save()
        .then(function(result) {
          result.poll = poll;
          return result;
        });
    });
}

pollSchema.statics.getActivations = function(pollId) {
  var Result = mongoose.model('Result');
  if (_.isString(pollId))
    pollId = new mongoose.Types.ObjectId(pollId);
  return Result.aggregate({ $match: { poll: pollId }})
    .project({
      activations: 1,
      label: 1,
      responsesCount: { $size: '$responses' }
    })
    .unwind('activations')
    .exec()
    // TODO: Adding a second project wasn't working properly so this is a 
    // temporary work around.
    .then(function(activations) {
      return _.sortBy(
        activations.map(function(a) {
          return {
            _id: a._id,
            start: a.activations.start,
            end: a.activations.end,
            label: a.label,
            responsesCount: a.responsesCount
          }
        }),
        // Start time, descending
        function(a) { return -a.start; }
      );
    });
}

pollSchema.statics.getLastResult = function(pollId, userId) {
  var Result = mongoose.model('Result');
  return Result.findOne({
    'poll': pollId,
    'activations.user': userId,
  }).sort('-activations.start')
    .select('_id')
    .exec()
    .then(function(result) {
      if (!result)
        return Promise.reject(errors.notFound('Result'));
      return result;
    });
}

pollSchema.statics.getResults = function(pollId) {
  var Result = mongoose.model('Result');
  if (_.isString(pollId))
    pollId = new mongoose.Types.ObjectId(pollId);
  return Result.aggregate({ $match: { poll: pollId } })
    .project({ 
      activations: 1, 
      label: 1,
      responsesCount: { $size: '$responses' },
      type: 1
    })
    .exec();
};

pollSchema.statics.ownerCreate = function(ownerId, fields) {
  var PollGroup = mongoose.model('PollGroup');
  if (!_.has(fields, 'group'))
    Promise.reject(errors.missingField('group'));
  return PollGroup.ownerFindById(ownerId, fields.group, 'pollCollection')
    .then(function(group) {
      fields.owners = group.owners;
      fields.pollCollection = group.pollCollection;
      return Poll.create(fields);
    });
}

pollSchema.statics.ownerFindById = function(ownerId, id, projection, options) {
  if (_.isString(projection))
    projection += ' owners';
  if (_.isObject(projection))
    projection.owners = 1;
  return Poll.findById(id, projection, options)
    .exec()
    .then(function(poll) {
      if (!poll)
        return Promise.reject(errors.notFound('Poll', id));
      if (!poll.hasOwner(ownerId))
        return Promise.reject(errors.forbidden());
      return poll;
    });
}

pollSchema.static.ownerFindByIdAndUpdate = function(ownerId, id, update, options) {
  update = prepareUpdate(update);
  return Poll.findOneAndUpdate(
    { _id: id, owners: ownerId },
    _.omit(update, updateOmittedFields),
    options || { new: true }
  )
    .exec()
    .then(function(poll) {
      if (!poll)
        return Promise.reject(errors.forbidden());
      return poll;
    });
}

pollSchema.statics.ownerRemoveById = function(ownerId, id) {
  return Poll.ownerFindById(ownerId, id, 'group')
    .then(function(poll) {
      return Promise.all([
        poll.remove(),
        poll.removeFromGroup()
      ]);
    })
    .return();
}

pollSchema.statics.ownerUpdateById = function(ownerId, id, update, options) {
  update = prepareUpdate(update);
  return Poll.update(
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


pollSchema.methods.hasOwner = function(userId) {
  var poll = this;
  return _.some(poll.owners, function(owner) {
    return owner.toString() === userId;
  });
}

pollSchema.methods.addToGroup = function() {
  var PollGroup = mongoose.model('PollGroup'),
      poll = this;
  return PollGroup.update(
    { _id: poll.group }, 
    { $addToSet: { polls: poll._id } }
  ).exec().then(function(result) {
    log.debug('poll.addToGroup: ', result);
  }).return(poll);
}

pollSchema.methods.removeFromGroup = function() {
  var PollGroup = mongoose.model('PollGroup'),
      poll = this;
  return PollGroup.update(
    { _id: poll.group }, 
    { $pull: { polls: poll._id } }
  ).exec().return(poll);
}

function prepareUpdate(update) {
  if (update._isNew) {
    delete update._isNew;
    update['$unset'] = { _isNew: '' };
  }
  return update;
}


var Poll = mongoose.model('Poll', pollSchema);

module.exports = Poll;