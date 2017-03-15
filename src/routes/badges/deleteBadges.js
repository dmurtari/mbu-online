var status = require('http-status-codes');

var Model = require('../../models');

module.exports = {
  delete: function(req, res) {
    Model.Badge.findById(req.params.id)
      .then(function(badge) {
        return badge.destroy();
      })
      .then(function() {
        return res.status(status.OK).end();
      })
      .catch(function() {
        return res.status(status.BAD_REQUEST).end();
      });
  }
};
