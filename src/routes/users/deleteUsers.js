var status = require('http-status-codes');

var Models = require('../../models');

module.exports = {
  deleteUser: function (req, res) {
    Models.User.findById(req.params.userId)
      .then(function (user) {
        user.destroy();
      })
      .then(function () {
        return res.status(status.OK).end();
      })
      .catch(function () {
        return res.status(status.BAD_REQUEST).end();
      });
  },
  deleteScout: function (req, res) {
    var userId = req.params.userId;
    var scoutId = req.params.scoutId;

    Models.User.findById(userId)
      .then(function (user) {
        return user.removeScouts(scoutId);
      })
      .then(function (deleted) {
        if (!deleted) {
          throw new Error('No scout to delete');
        }

        res.status(status.OK).end();
      })
      .catch(function () {
        return res.status(status.BAD_REQUEST).end();
      });
  }
};
