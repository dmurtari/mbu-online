var status = require('http-status-codes');

var Model = require('../../models');

module.exports = {
  create: function (req, res) {
    var newEvent = req.body;
    Model.Event.create(newEvent)
      .then(function (event) {
        return res.status(status.CREATED).json({
          message: 'Event successfully created',
          event: event
        });
      })
      .catch(function (err) {
        return res.status(status.BAD_REQUEST).json({
          message: 'Event creation failed',
          error: err
        });
      });
  },
  createOffering: function (req, res) {
    var eventId = req.params.id;

    Model.Event.findById(eventId)
      .then(function (event) {
        return event.addOffering(req.body.badge_id, { through: req.body.offering });
      })
      .then(function (offering) {
        if (!offering) {
          throw new Error('Could not create offering');
        }

        return Model.Event.findById(eventId, {
          include: [{
            model: Model.Badge,
            as: 'offerings',
            through: {
              as: 'details'
            }
          }]
        });
      })
      .then(function (event) {
        res.status(status.CREATED).json({
          mesage: 'Offering successfully created',
          event: event
        });
      })
      .catch(function (err) {
        res.status(status.BAD_REQUEST).json({
          message: 'Offering creation failed',
          error: err
        });
      });
  },
  createPurchasable: function (req, res) {
    var eventId = req.params.id;
    var purchasable;

    Model.Purchasable.create(req.body)
      .then(function (createdPurchasable) {
        purchasable = createdPurchasable;
        return Model.Event.findById(eventId);
      })
      .then(function (event) {
        return event.addPurchasable(purchasable);
      })
      .then(function (event) {
        if (!event) {
          throw new Error('Could not create purchasable');
        }

        return Model.Event.findById(eventId, {
          include: [{
            model: Model.Purchasable,
            as: 'purchasables'
          }]
        });
      })
      .then(function (event) {
        res.status(status.CREATED).json({
          message: 'Purchasable successfully created',
          purchasables: event.purchasables
        });
      })
      .catch(function (err) {
        res.status(status.BAD_REQUEST).json({
          message: 'Purchasable creation failed',
          error: err
        });
      });
  },
  setCurrentEvent: function (req, res) {
    var eventId = req.body.id;
    var event;

    Model.Event.findById(eventId)
      .then(function (eventFromDb) {
        if (!eventFromDb) {
          throw new Error('Event to set as current not found');
        }

        event = eventFromDb;
        return Model.CurrentEvent.findOne();
      })
      .then(function (currentEvent) {
        if (!currentEvent) {
          return Model.CurrentEvent.create({});
        }
        return currentEvent;
      })
      .then(function (currentEvent) {
        return currentEvent.setEvent(event, {
          include: [{
            model: Model.Event
          }]
        });
      })
      .then(function (currentEvent) {
        return Model.Event.findById(currentEvent.event_id);
      })
      .then(function (event) {
        res.status(status.OK).json({
          message: 'Current event set',
          currentEvent: event
        });
      })
      .catch(function (err) {
        res.status(status.BAD_REQUEST).json({
          message: 'Setting current event failed',
          error: err
        });
      });
  }
};
