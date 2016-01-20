module.exports = function(passport, User) {

  return require('./auth.local')(passport, User);
  
}