var status = require('http-status-codes');

var Model = require('../../models');

module.exports = {
  update: function (req, res) {
    Model.Badge.findById(req.params.id)
      .then(function (badge) {
        if (!badge) {
          throw new Error('Badge to update not found');
        }

        return badge.update(req.body);
      })
      .then(function (badge) {
        return res.status(status.OK).json({
          message: 'Badge updated successfully',
          badge: badge.dataValues
        });
      })
      .catch(function (err) {
        return res.status(status.BAD_REQUEST).json({
          message: 'Error updating badge',
          error: err
        });
      });
  }
};
