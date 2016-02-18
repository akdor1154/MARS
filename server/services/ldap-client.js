var ldapjs = require('ldapjs')
  , Promise = require('bluebird')
  , _ = require('underscore')
  , errors = require('../utils/errors')
  , log = require('../utils/log');

module.exports = function(url) {
  
  // var client = ldapjs.createClient({
    // url: url
  // });
  
  return {
    filterFromObject: filterFromObject, 
    getUser: getUser,
    getUsers: getUsers
  }
  
  function getUser(base, options) {
    options.sizeLimit = 1;
    return getUsers(base, options)
      .then(function(users) {
        return _.first(users);
      });
  }
  
  function getUsers(base, options) {
    return new Promise(function(resolve, reject) {
      var users = [];
      // Merge options with defaults
      _.extend({
          scope: 'sub'
        }, options);
      if (_.isObject(options.filter) 
          && !ldapjs.filters.isFilter(options.filter)) {
        options.filter = filterFromObject(options.filter);
      }
      client.search(base, options, function(error, result) {
        if (error)
          return reject(error);
        result.on('searchEntry', function(entry) {
          users.push(entry.object);
        });
        result.on('error', function(err) {
          reject(err);
        });
        result.on('end', function(result) {
          if (users.length > 0)
            resolve(users);
          else
            reject(errors.notFound('User', options.filter));
        });
      });
    });
  }
  
  function filterFromObject(obj, outerFilter) {
    var filters = [];
    for (var field in obj) {
      var value = obj[field];
      switch (field) {
        case '$and': 
          filters.push(
            filterFromObject(value, ldapjs.filters.AndFilter)
          );
          break;
        case '$or': 
          filters.push(
            filterFromObject(value, ldapjs.filters.OrFilter)
          );
          break;
        default: 
          filters.push(
            new ldapjs.filters.EqualityFilter({ 
              attribute: field, value: value 
            })
          );
      }
    }
    if (filters.length > 1) {
      outerFilter = outerFilter || ldapjs.filters.AndFilter;
      return new outerFilter({ filters: filters });
    }
    return _.first(filters);
  }
  
}