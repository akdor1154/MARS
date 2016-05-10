var LocalStrategy = require('passport-local').Strategy

module.exports = function(passport, User) {

  passport.use('local', new LocalStrategy(
    function(username, password, done) {
      console.log('user.findone is ', User.findOne)
      User.findOne({ username: username })
        .then(function(user) {
          if (!user) {
            //Uncomment to create new local users for testing 
            var newUser = new User()
            newUser.username = username
            newUser.password = password
            group = 'poller'
            name = {first: 'Percy', last: 'Presenton'}
            newUser.hashPassword()
            .then( function () {
              console.log('nq'+newUser)
              newUser.save(function(err) {
                if(err) {
                  console.log(err)
                } else {
                  console.log('user: ' + username + " saved.")
                }
              })}
            )
            return done(null, false)
          }

          if (!user.isPasswordValid(password)) {
            return done(null, false)
          }
          
          return done(null, user)
        })
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