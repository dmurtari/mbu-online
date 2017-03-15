var status = require('http-status-codes');

var Model = require('../../models');

module.exports = {
  delete: function (req, res) {
    Model.Event.findById(req.params.id)
      .then(function (event) {
        return event.destroy();
      })
      .then(function () {
        return res.status(status.OK).end();
      })
      .catch(function () {
        return res.status(status.BAD_REQUEST).end();
      });
  },
  deleteOffering: function (req, res) {
    var eventId = req.params.eventId;
    var badgeId = req.params.badgeId;

    Model.Event.findById(eventId)
      .then(function (event) {
        return event.removeOfferings(badgeId);
      })
      .then(function () {
        return res.status(status.OK).end();
      })
      .catch(function () {
        return res.status(status.BAD_REQUEST).end();
      });
  },
  deletePurchasable: function (req, res) {
    var eventId = req.params.eventId;
    var purchasableId = req.params.purchasableId;

    Model.Event.findById(eventId)
      .then(function (event) {
        return event.removePurchasables(purchasableId);
      })
      .then(function () {
        return res.status(status.OK).end();
      })
      .catch(function () {
        return res.status(status.BAD_REQUEST).end();
      });
  }
};
