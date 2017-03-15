var passport = require('passport');
var status = require('http-status-codes');
var Models = require('../models');

module.exports = function (req, res, next) {
  var err;

  return passport.authenticate('jwt', { session: false }, function (error, user) {
    if (user.role === 'admin' || user.role === 'teacher') {
      return next();
    }

    return Models.Scout.findById(req.params.scoutId)
      .then(function (scout) {
        if (!scout) {
          err = new Error('Scout not found');
          err.status = status.BAD_REQUEST;
          throw err;
        }

        if (scout.user_id === user.id && user.role === 'coordinator') {
          return next();
        } else {
          err = new Error('Current user is not authorized to update this scout');
          err.status = status.UNAUTHORIZED;
          throw err;
        }
      })
      .catch(function (err) {
        next(err);
      });
  })(req, res, next);
};
