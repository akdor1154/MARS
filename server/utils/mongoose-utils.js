var mongoose = require('mongoose');
var Promise = require('bluebird');
var _ = require('underscore');
var log = require('./log');

module.exports = {
  id: id,
  saveMany: saveMany
};


function id(docOrId) {
  if (_.isObject(docOrId) && _.has(docOrId, '_id')) {
    docOrId = docOrId._id;
  }
  if (docOrId instanceof mongoose.Document) {
    docOrId = docOrId.get('_id');
  }
  if (docOrId instanceof mongoose.Types.ObjectId) {
    return docOrId;
  }
  if (_.isString(docOrId)) {
    return new mongoose.Types.ObjectId(docOrId);
  }
  throw new Error('Could not get ID from: ' + docOrId.toString());
}

function saveMany(docs, promise, index) {
  promise = promise || new Promise();
  index = index || 0;
  var doc = docs[index];
  
  if (index === 0)
    log.trace('Saving batch of ' + docs.length + ' documents');
  
  doc.save().then(
    function(saved) {
      log.trace('[' + index + ']  Saved document: ', saved._id.toString());
      index++;
      if (index < docs.length) {
        module.exports.saveMany(docs, promise, index);
      }
      else {
        log.trace('Saving batch complete');
        promise.fulfill();
      }
    },
    function(err) {
      log.error(err);
      promise.reject(err);
    }
  );
  
  return promise;
}