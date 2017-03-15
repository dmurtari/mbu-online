var passport = require('passport');
var status = require('http-status-codes');

module.exports = function (req, res, next) {
  return passport.authenticate('jwt', { session: false }, function (err, user) {
    if (req.body.role && user.role !== 'admin' ||
      req.body.approved && user.role !== 'admin' ||
      req.body.password && (!(user.role === 'admin')) && req.params.userId != user.id) {
      return res.status(status.UNAUTHORIZED).json({
        message: 'Only admins are allowed to update roles'
      });
    } else {
      return next();
    }
  })(req, res, next);
};
