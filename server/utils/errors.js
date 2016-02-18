module.exports = {};

function MarsError(code, message, data) {
  this.name = 'MarsError';
  this.code = code || 10000;
  this.message = message || 'Unknown error';
  this.stack = (new Error()).stack;
  if (data) this.data = data;
}
MarsError.prototype = Object.create(Error.prototype);
MarsError.prototype.constructor = MarsError;
module.exports.MarsError = MarsError;


module.exports.unauthorized = function(message) {
  return new MarsError(401, message || 'Unauthorized');
}

module.exports.forbidden = function(message) {
  message = message || 'Permission denied'
  return new MarsError(403, message);
}

module.exports.notFound = function(itemName, id, message) {
  if (id)
    itemName += ' identified by "' + id + '"';
  message = message || itemName + ' not found';
  return new MarsError(404, message);
}


module.exports.internal = function(err) {
  return new MarsError(500, err.message);
}


module.exports.missingFields = function(fields) {
  return new MarsError(10001, 'Missing required fields', {
    fields: fields
  });
}

module.exports.invalidFields = function(fields) {
  return new MarsError(10002, 'Invalid field values', {
    fields: fields
  });
}

module.exports.invalidId = function(idField) {
  var fields = {};
  fields[idField || '_id'] = 'String required'
  return module.exports.invalidFields(fields);
}

module.exports.pollNotActive = function() {
  return new MarsError(10100, 'Poll not active');
}

module.exports.resultNotActive = function() {
  return new MarsError(10200, 'Result not active');
}

module.exports.resultAlreadyActive = function() {
  return new MarsError(10201, 'Result already active');
}