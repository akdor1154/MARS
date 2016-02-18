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
    nickname: String
  },
  department: String,
  division: String,
  location: String,
  source: String,
  subscriptions: [{ type: Schema.Types.ObjectId, ref: 'PollCollection', index: true, default: [] }]
}, { collection: 'users' });
userSchema.set('toObject', { retainKeyOrder: true });

userSchema.index({ 'name.first': 'text', 'name.last': 'text', 'username': 'text' });


userSchema.statics.getSubscriptions = function(userId) {
  return User.findById(userId, 'subscriptions')
    .exec()
    .then(function(user) {
      if (!user)
        return Promise.reject(errors.notFound('User', userId));
      return user.subscriptions;
    });
}

userSchema.statics.populateSyncedUsers = function(usernames, authConfig) {
  var promises = [];
  if (_.isFunction(authConfig.syncUser)) {
    usernames.forEach(function(username, i) {
      promises.push(
        authConfig.syncUser(username).then(function(user) {
          usernames[i] = user;
        })
      );
    });
  }
  else {
    usernames.forEach(function(username, i) {
      promises.push(
        User.findOne({ username: username }).then(function(user) {
          usernames[i] = user;
        })
      );
    });
  }
  return Promise.all(promises);
}

userSchema.statics.search = function(phrase, conditions, authConfig) {
  if (_.isFunction(authConfig.searchUsers))
    return authConfig.searchUsers(phrase, conditions);
  return errors.notSupported('Auth config doesn\'t support searching for users');
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