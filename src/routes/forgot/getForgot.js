var status = require('http-status-codes');

var Models = require('../../models');

module.exports = {
  reset: function (req, res) {
    Models.User.findAll({
      where: {
        reset_password_token: req.params.token,
        reset_token_expires: { $gt: Date.now() }
      }
    })
      .then(function (user) {
        if (!user) {
          throw new Error('No user found');
        }

        return res.status(status.OK).json({
          message: 'Reset token is valid'
        });
      })
      .catch(function () {
        return res.status(status.BAD_REQUEST).json({
          message: 'Reset token invalid or expired'
        });
      });
  }
};
