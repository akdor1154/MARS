
// This script can be used to populate the database with users.
//
// 1. Change config values below as desired
// 2. Run `node addUser.js`
//


// CONFIG HERE
////////////////

var batch = false; // use "true" if creating multiple users
var userType = 'poller'; // can be 'poller' or 'responder'
var password = '123'; // used in batch and single user creation
var username = 'p1'; // only used if batch == false
var usernameBase = 'a'; // only used if batch == true
var newUsers = 10; // only used if batch == true




// LEAVE THIS AS IS
/////////////////////

// DATABASE
var mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/mars');
mongoose.Promise = Promise;


// // USER MODEL
var Schema = mongoose.Schema
var bcrypt = require('bcrypt')

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


// CREATE USERS
var usernames = []
if (batch) {
  for (i = 1; i <= newUsers; i++) { usernames.push(usernameBase+i) }
} else {
  usernames.push(username);
}

usernames.forEach(function(u){
  User.findOne({ username: u })
  .then(function(user) {
    if (!user) {
      var newUser = new User({
        username: u,
        password: password,
        group: userType,
        name: {
          first: 'First-' + u,
          last: 'Last-' + u
        }
      });

      newUser.hashPassword()
      .then(function() {
        return newUser.save();
      })
      .then(function(savedUser) {
        console.log('created user: ' + savedUser.username + ', pw: ' + password)
      })
      .catch(function(err) {
        console.log('failed to create user: ' + err)
      });
    } else {
      console.log(user.username + ' already exists!')
    }
  });
});