var LocalStrategy = require('passport-local').Strategy

module.exports = function(passport, User) {

  passport.use('local', new LocalStrategy(
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
  ));
  
  passport.serializeUser(function(user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function(userId, done) {
    done(null, userId);
  });
  
  
  return {
    
    login: function(req, res) {
      res.redirect('./#/login');
    },
    
    process: function(req, res) {
      passport.authenticate('local', function(err, user, info) {
        if (err) {
          throw err;
        }
        if (!user) {
          return res.status(401).json('Invalid credentials');
        }
        req.login(user, function(err) {
          return res.json(user);
        });
      })(req, res);
    },
    
    logout: function(req, res) {
      req.logout();
      res.redirect('/');
    }
    
  }

}