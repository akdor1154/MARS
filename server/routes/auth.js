var express = require('express'),
    router = express.Router(),
    passport = require('passport'),
    log = require('../utils/log');

function auth(User) {
  
  router.post('/is-authenticated', function(req, res, next) {
    log.trace('/is-authenticated');
    if (req.user) {
      User.findById(req.user)
        .exec()
        .then(function(user) {
          res.json(user);
        });
    }
    else {
      return res.sendStatus(401);
    }
  });
  
  router.post('/login', function(req, res, next) {
    log.trace('/login');
    passport.authenticate('local', function(err, user, info) {
      if (err) {
        log.error(err);
        return next(err);
      }
      if (!user) {
        log.info('Login failed: ', info);
        return res.status(401).json('Invalid credentials');
      }
      req.login(user, function(err) {
        log.info('Logged in', req.user._id.toString());
        log.debug(req.user);
        return res.json(user);
      });
    })(req, res, next);
  });
  
  router.post('/logout', function(req, res, next) {
    log.info('Logged out', req.user.toString());
    req.logout();
    res.send();
  });
  
  return router;
}

module.exports = auth;