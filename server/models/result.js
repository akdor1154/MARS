var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , Promise = require('bluebird')
  , _ = require('underscore')
  , errors = require('../utils/errors')
  , log = require('../utils/log');

var resultSchema = new Schema({
	poll: { type: Schema.Types.ObjectId, ref: 'Poll', index: true },
  type: String,
  token: String,
	label: String,
  active: { type: Boolean, default: false, index: true },
	activations: [{ 
    start: Date,
    end: Date
  }],
  responses: [{
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    time: { type: Date, default: Date.now },
    data: {}
  }],
  group: { type: Schema.Types.ObjectId, ref: 'PollGroup', index: true },
  pollCollection: { type: Schema.Types.ObjectId, ref: 'PollCollection', index: true },
	data: {}
});
resultSchema.set('toObject', { retainKeyOrder: true });


resultSchema.statics.activate = function(resultId) {
  return Result.findById(resultId)
    .exec()
    .then(function(result) {
      if (result === null)
        return Promise.reject(errors.notFound('Result', resultId));
      if (result.active)
        return Promise.reject(errors.resultAlreadyActive());
      return result.activate();
    });
}

resultSchema.statics.createForPoll = function(poll) {
  var result = new Result({
    poll: poll._id,
    type: poll.type,
    group: poll.group,
    pollCollection: poll.pollCollection,
    token: poll.pollCollection.token,
    activations: [],
    responses: [],
    data: {}
  });
  return result;
}

resultSchema.statics.deactivate = function(resultId) {
  return Result.findById(resultId)
    .exec()
    .then(function(result) {
      if (result === null)
        return Promise.reject(errors.notFound('Result', resultId));
      if (!result.active)
        return Promise.reject(errors.resultNotActive());
      return result.deactivate();
    });
}

resultSchema.statics.resume = function(resultId, fromId) {
  var result;
  return Result.findById(resultId)
    .populate('poll')
    .exec()
    .then(function(r) {
      result = r;
      if (result === null)
        return Promise.reject(errors.notFound('Result', resultId));
      if (result.active)
        return Promise.reject(errors.resultAlreadyActive());
      if (fromId)
        return Result.findOneAndRemove({ _id: fromId });
    })
    .then(function(removedResult) {
      if (removedResult) {
        result.mergeActivations(removedResult);
        result.mergeResponses(removedResult);
      }
      return result.activate();
    });
}

resultSchema.statics.saveResponse = function(resultId, response) {
  return Result.update(
    { _id: resultId, active: true },
    { $push: { responses: response } }
  )
    .exec()
    .then(function(output) {
      if (!output.nModified)
        Promise.reject(errors.resultNotActive());
    })
    .return(response);
};


resultSchema.methods.activate = function() {
  var result = this;
  if (result.active)
    return Promise.resolve(result);
  result.activations.push({ start: new Date(), end: null });
  result.active = true;
  return result.save();
}

resultSchema.methods.deactivate = function() {
  var result = this;
  if (!result.active)
    return Promise.resolve(result);
  _.last(result.activations).end = new Date();
  result.active = false;
  return result.save();
}

resultSchema.methods.mergeActivations = function(fromResult) {
  var result = this;
  result.activations = _.sortBy(
    result.activations.concat(fromResult.activations),
    function(activation) { return activation.start }
  );
}

resultSchema.methods.mergeResponses = function(fromResult) {
  var result = this;
  result.responses = _.sortBy(
    result.responses.concat(fromResult.responses),
    function(response) { return response.time }
  );
}


var Result = mongoose.model('Result', resultSchema);

module.exports = Result;