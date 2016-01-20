var mongoose = require('mongoose');

module.exports = function() {

  mongoose.connect('mongodb://localhost/mars');
  mongoose.Promise = require('bluebird');
  
  return mongoose;

}