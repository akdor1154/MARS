var ldapjs = require('ldapjs')
  , Promise = require('bluebird')
  , _ = require('underscore')
  , errors = require('../utils/errors')
  , log = require('../utils/log');

module.exports = function(url) {
  
  var client = ldapjs.createClient({
    url: url
  });
  
  return {
    getUser: getUser
  }
  
  
  function getUser(filter, base, attributes) {
    return new Promise(function(resolve, reject) {
      var userFound = false;
      client.search(base, {
        scope: 'sub',
        attributes: attributes || [],
        filter: filter
      }, function(error, result) {
        if (error)
          return reject(error);
        result.on('searchEntry', function(entry) {
          userFound = true;
          resolve(entry.object);
        });
        result.on('error', function(err) {
          reject(err);
        });
        result.on('end', function(result) {
          if (!userFound)
            reject(errors.notFound('User', filter));
        });
      });
    });
  }
  
}