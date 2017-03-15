var status = require('http-status-codes');
var _ = require('lodash');

var Model = require('../../models');

module.exports = {
  get: function (req, res) {
    var queryableFields = ['name', 'semester'];
    var query = {};

    _.forEach(queryableFields, function (field) {
      if (req.query[field]) query[field] = req.query[field];
    });

    Model.Badge.findAll({ where: query })
      .then(function (badges) {
        if (badges.length < 1) {
          return res.status(status.NOT_FOUND).end();
        }

        return res.status(status.OK).json(badges);
      });
  }
};












