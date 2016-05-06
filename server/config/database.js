var mongoose = require('mongoose');

module.exports = function() {

  mongoose.connect('mongodb://ds015902.mlab.com:15902/heroku_gn9rm30l');
  mongoose.Promise = require('bluebird');
  
  return mongoose;

}
