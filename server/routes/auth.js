var express = require('express'),
    router = express.Router(),
    passport = require('passport'),
    log = require('../utils/log');

function auth(authConfig, User) {
  
  router.post('/is-authenticated', function(req, res, next) {
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
  
  router.get('/login', function(req, res, next) {
    if (_.isFunction(authConfig.login))
      authConfig.login(req, res);
  });
  
  router.post('/login', function(req, res, next) {
    if (_.isFunction(authConfig.process))
      authConfig.process(req, res);
  });
  
  router.get('/logout', function(req, res, next) {
    if (_.isFunction(authConfig.logout))
      authConfig.logout(req, res);
  });
  
  function useJsonRedirect(res) {
    res.redirect = function(url) {
      res.json({ url: url });
    }
  }
  
  return router;
}

module.exports = auth;