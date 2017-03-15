var passport = require('passport');
var status = require('http-status-codes');
var _ = require('lodash');

function isAuthorized(roles) {
  return function(req, res, next) {
    passport.authenticate('jwt', { session: false }, function(err, user) {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(status.UNAUTHORIZED).json({
          message: 'Could not find a user with the given token'
        });
      }

      if (!user.approved) {
        err = new Error('Account has not been approved yet');
        err.status = status.UNAUTHORIZED;
        throw err;
      }

      var authorizedRoles = _.union([ 'admin' ], roles);
      if (_.includes(authorizedRoles, user.role)) {
        return next();
      } else {
        return res.status(status.UNAUTHORIZED).json({
          message: 'Current role is not authorized to access this endpoint'
        });
      }
    })(req, res, next);
  };
}

module.exports = isAuthorized;
