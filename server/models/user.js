var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , Promise = require('bluebird')
  , bcrypt = require('bcrypt')
  , _ = require('underscore')
  , errors = require('../utils/errors')
  , log = require('../utils/log');

  
var userSchema = new Schema({
	username: { type: String, index: true }, 
  password: String,
  group: String,
	name: {
    first: String,
    last: String,
    initials: String,
    anonymous: Boolean,
    display: String
  },
  department: String,
  division: String,
  location: String,
  source: String,
	subscriptions: [{ type: Schema.Types.ObjectId, ref: 'PollCollection', index: true, default: [] }]
}, { collection: 'users' });
userSchema.set('toObject', { retainKeyOrder: true });

userSchema.index({ 'name.first': 'text', 'name.last': 'text', 'username': 'text' });


userSchema.statics.getSubscriptions = function(userId, populate) {
  var query = User.findById(userId, 'subscriptions');
  if (populate === true)
    query.populate('subscriptions');
  else if (populate)
    query.populate('subscriptions', populate);
  return query.exec()
    .then(function(user) {
      if (!user)
        return Promise.reject(errors.notFound('User', userId));
      return user.subscriptions;
    });
}

userSchema.statics.search = function(phrase, group) {
  var phraseRegex = new RegExp(
    phrase.replace(/[\\^$.|?*+()\[\]]/g, '\\$&'), 'i');
  conditions = { 
    $or: [
      { username: phraseRegex },
      { 'name.first': phraseRegex },
      { 'name.last': phraseRegex }
    ]
  };
  group && (conditions.group = group);  
  return User.find(conditions);
}

userSchema.statics.subscribeToCollection = function(userId, collectionToken) {
  collectionToken = collectionToken.toUpperCase();
  var PollCollection = mongoose.model('PollCollection');
  return PollCollection.findOne({ token: collectionToken })
    .select('_id')
    .exec()
    .then(function(collection) {
      if (!collection)
        return Promise.reject(errors.notFound('Collection', 'token:' + collectionToken));
      return User.update(
        { _id: userId }, 
        { $addToSet: { subscriptions: collection._id } }
      ).exec().return(collection._id);
    });
}

userSchema.statics.unsubscribeFromCollection = function(userId, collectionId) {
  if (_.isString(collectionId))
    collectionId = new mongoose.Types.ObjectId(collectionId);
  return User.update(
    { _id: userId }, 
    { $pull: { subscriptions: collectionId } }
  ).exec();
}


userSchema.methods.isPasswordValid = function(password) {
  var user = this;
  return new Promise(function(resolve, reject) {
    bcrypt.compare(password, user.password, function(err, res) {
      if (err)
        return reject(err);
      resolve(res);
    }); 
  });
}

userSchema.methods.hashPassword = function() {
  var user = this;
  return new Promise(function(resolve, reject) {
    bcrypt.hash(user.password, 10, function(err, hash) {
      if (err)
        return reject(err);
      user.password = hash;
      resolve(user);
    }); 
  });
}


var User = mongoose.model('User', userSchema);

module.exports = User;
