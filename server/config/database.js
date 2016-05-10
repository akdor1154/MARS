var mongoose = require('mongoose');

module.exports = function() {

  var options = {
    server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } }, 
    replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 } }
  };
  
  process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/mars'

  mongoose.connect(process.env.MONGODB_URI, options);
  mongoose.Promise = require('bluebird');
  mongoose.set('debug', true)
  
  console.log('connected as ' + process.env.MONGODB_URI)
  
  return mongoose;

}
