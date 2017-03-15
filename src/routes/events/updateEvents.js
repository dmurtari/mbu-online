var status = require('http-status-codes');

var Model = require('../../models');

module.exports = {
  update: function (req, res) {
    Model.Event.findById(req.params.id, {
      include: [{
        model: Model.Badge,
        as: 'offerings',
        through: {
          as: 'details'
        }
      }]
    })
      .then(function (event) {
        if (!event) {
          throw new Error('Event to update not found');
        }

        return event.update(req.body);
      })
      .then(function (event) {
        return res.status(status.OK).json({
          message: 'Event updated successfully',
          event: event.dataValues
        });
      })
      .catch(function (err) {
        return res.status(status.BAD_REQUEST).json({
          message: 'Error updating event',
          error: err
        });
      });
  },
  updateOffering: function (req, res) {
    var offeringUpdate = req.body;
    var eventId = req.params.eventId;
    var badgeId = req.params.badgeId;

    Model.Event.findById(eventId, {
      include: [{
        model: Model.Badge,
        as: 'offerings'
      }]
    })
      .then(function (event) {
        if (!event) {
          throw new Error('Event to update not found');
        }

        return event.getOfferings({
          where: {
            id: badgeId
          }
        });
      })
      .then(function (offerings) {
        var offering = offerings[0];
        return offering.Offering.update(offeringUpdate);
      })
      .then(function (offering) {
        res.status(status.OK).json({
          message: 'Offering updated successfully',
          offering: offering
        });
      })
      .catch(function (err) {
        res.status(status.BAD_REQUEST).json({
          message: 'Error updating offering',
          error: err
        });
      });
  },
  updatePurchasable: function (req, res) {
    var purchasableUpdate = req.body;
    var purchasableId = req.params.purchasableId;
    var eventId = req.params.eventId;

    Model.Event.findById(eventId)
      .then(function (event) {
        if (!event) {
          throw new Error('event to update not found');
        }

        return event.getPurchasables({
          where: {
            id: purchasableId
          }
        });
      })
      .then(function (purchasables) {
        var purchasable = purchasables[0];
        return purchasable.update(purchasableUpdate);
      })
      .then(function (purchasable) {
        res.status(status.OK).json({
          message: 'Purchasable updated successfully',
          purchasable: purchasable
        });
      })
      .catch(function (err) {
        res.status(status.BAD_REQUEST).json({
          message: 'Error updating purchasable',
          error: err
        });
      });
  }
};
