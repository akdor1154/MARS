module.exports = function(session, db) {
  
  var MongoStore = require('connect-mongo')(session);
  
  return {
    secret: 'Lg\NHAfa$F%%`1:eQMD6 QiHYO*kW7b-c6#+', // CHANGE THIS ON YOUR SERVER
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: db.connection })
  };
  
}