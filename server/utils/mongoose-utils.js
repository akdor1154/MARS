var mongoose = require('mongoose'),
    Promise = require('bluebird'),
    log = require('./log');

module.exports = {};

module.exports.saveMany = function(docs, promise, index) {
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