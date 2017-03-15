var passport = require('passport');
var status = require('http-status-codes');
var _ = require('lodash');

function isCurrentUser(otherAuthorizedRoles) {
  return function(req, res, next) {
    passport.authenticate('jwt', { session: false }, function(err, user) {
      var roles = _.union(['admin'], otherAuthorizedRoles);

      if (_.includes(roles, user.role)) {
        return next();
      }

      if ((req.params.userId && req.params.userId != user.id ) ||
        (req.query.id && req.query.id != user.id)) {
        return res.status(status.UNAUTHORIZED).json({
          message: 'Not the current user'
        });
      } else {
        return next();
      }
    })(req, res, next);
  };
}

module.exports = isCurrentUser;
