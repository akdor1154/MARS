var mongoose = require('mongoose');

module.exports = function() {

  var options = {
    server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } }, 
    replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 } }
  };
  
  var username = process.env.MONGODB_USERNAME;
  var password = process.env.MONGODB_PASSWORD;
  var host = process.env.MONGODB_HOST;
  var db = process.env.MONGODB_DB;
   
  var mongodbUri = 'mongodb://username:password@host/db';
   
  mongoose.connect(mongodbUri, options);
  mongoose.Promise = require('bluebird');
  
  return mongoose;

}
