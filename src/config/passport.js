var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;

var Model = require('../models');
var config = require('../config/secrets');

module.exports = function (passport) {
  var opts = {};
  opts.secretOrKey = config.APP_SECRET;
  opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
  passport.use(new JwtStrategy(opts, function (jwt_payload, done) {
    Model.User.findById(jwt_payload)
      .then(function (user) {
        if (user) {
          return done(null, user.dataValues);
        } else {
          return done(null, false);
        }
      })
      .catch(function (err) {
        return done(err, false);
      });
  }));
};
