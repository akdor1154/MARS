var mongoose = require('mongoose');

module.exports = function() {

  mongoose.connect('mongodb://ds015902.mlab.com:15902/heroku_gn9rm30l');
  var options = {
    server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } }, 
    replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 } }
  };       
   
  var mongodbUri = 'mongodb://process.env.MONGODB_USERNAME:process.env.MONGODB_PASSWORD@ds015902.mlab.com:15902/heroku_gn9rm30l';
   
  mongoose.connect(mongodbUri, options);
  mongoose.Promise = require('bluebird';)
  
  return mongoose;

}
