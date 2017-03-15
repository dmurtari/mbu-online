var status = require('http-status-codes');

var Model = require('../../models');

module.exports = {
  create: function (req, res) {
    var newBadge = req.body;

    Model.Badge.create(newBadge)
      .then(function (badge) {
        res.status(status.CREATED).json({
          message: 'Badge successfully created',
          badge: badge
        });
      })
      .catch(function (err) {
        res.status(status.BAD_REQUEST).json({
          message: 'Failed to create badge',
          error: err
        });
      });
  }
};
