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
    login: login,
    logout: logout,
    process: process,
    searchUsers: searchUsers
  }
  
    
  function login(req, res) {
    res.redirect('./#/login');
  }
    
  function logout(req, res) {
    req.logout();
    res.redirect('/');
  }
    
  function process(req, res) {
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
  }
  
  function searchUsers(phrase, conditions) {
    conditions = conditions || {};
    conditions['$or'] = conditions['$or'] || [];
    var phraseRegex = new RegExp(
      phrase.replace(/[\\^$.|?*+()\[\]]/g, '\\$&'), 'i');
    conditions['$or'].push({ username: phraseRegex });    
    conditions['$or'].push({ 'name.first': phraseRegex });    
    conditions['$or'].push({ 'name.last': phraseRegex });
    return User.find(conditions)
      .select('username name.first name.last')
      .exec();
  }

}