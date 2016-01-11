var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , log = require('../utils/log');

module.exports = function(User) {
  
  passport.serializeUser(function(user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function(userId, done) {
    done(null, userId);
  });
  
  return passport.use(
    new LocalStrategy(
      function(username, password, done) {
        User.findOne({ username: username })
          .then(function(user) {
            if (!user)
              return done(null, false);
            return [user, user.isPasswordValid(password)];
          })
          .spread(function(user, passwordValid) {
            if (!passwordValid)
              return done(null, false);
            return done(null, user);
          });
      }
    )
  );
  
}