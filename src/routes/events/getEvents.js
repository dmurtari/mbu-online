var status = require('http-status-codes');
var _ = require('lodash');

var Model = require('../../models');
var registrationInformation = require('../../models/queries/registrationInformation');

module.exports = {
  get: function (req, res) {
    var queryableFields = ['id', 'year', 'semester'];
    var query = {};

    _.forEach(queryableFields, function (field) {
      if (req.query[field]) query[field] = req.query[field];
    });

    Model.Event.findAll({
      where: query,
      include: [{
        model: Model.Badge,
        as: 'offerings',
        through: {
          as: 'details'
        }
      }, {
        model: Model.Purchasable,
        as: 'purchasables'
      }]
    })
      .then(function (events) {
        return res.status(status.OK).json(events);
      })
      .catch(function (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({
          message: 'Error getting events',
          error: err
        });
      });
  },
  getAssignees: function (req, res) {
    var eventId = req.params.id;

    Model.Offering.findAll({
      where: {
        event_id: eventId
      },
      attributes: [['id', 'offering_id'], 'duration', 'periods', 'requirements'],
      include: [{
        model: Model.Badge,
        as: 'badge',
        attributes: ['name', ['id', 'badge_id']]
      }, {
        model: Model.Registration,
        as: 'assignees',
        attributes: {
          exclude: ['projectedCost', 'actualCost'],
          include: [['id', 'registration_id'], 'notes'],
        },
        through: {
          as: 'assignment',
          attributes: ['periods', 'completions']
        },
        include: [{
          model: Model.Scout,
          as: 'scout',
          attributes: ['firstname', 'lastname', 'troop']
        }]
      }]
    })
      .then(function (offerings) {
        return res.status(status.OK).json(offerings);
      })
      .catch(function (err) {
        res.status(status.BAD_REQUEST).end();
      })
  },
  getPurchasables: function (req, res) {
    var eventId = req.params.id;

    Model.Event.findById(eventId)
      .then(function (event) {
        return event.getPurchasables();
      })
      .then(function (purchasables) {
        res.status(status.OK).json(purchasables);
      })
      .catch(function () {
        res.status(status.BAD_REQUEST).end();
      });
  },
  getRegistrations: function (req, res) {
    var eventId = req.params.id;
    var query = _.cloneDeep(registrationInformation);

    query.where = {
      event_id: eventId
    };

    Model.Registration.findAll(query)
      .then(function (registrations) {
        res.status(status.OK).json(registrations);
      })
      .catch(function () {
        res.status(status.BAD_REQUEST).end();
      });
  },
  getCurrentEvent: function (req, res) {
    Model.CurrentEvent.findOne({
      include: [{
        model: Model.Event
      }]
    })
      .then(function (currentEvent) {
        res.status(status.OK).send(currentEvent.Event);
      })
      .catch(function () {
        res.status(status.OK).end();
      });
  },
  getPotentialIncome: function (req, res) {
    income(req, res, 'projectedCost');
  },
  getIncome: function (req, res) {
    income(req, res, 'actualCost');
  },
  getStats: function (req, res) {
    var resultObject = {};

    Model.Event.findById(req.params.id, {
      include: [{
        model: Model.Scout,
        as: 'attendees',
        attributes: ['id', 'firstname', 'lastname', 'troop']
      }, {
        model: Model.Badge,
        as: 'offerings',
        attributes: ['id', 'name'],
      }]
    })
      .then(function (event) {
        resultObject.scouts = event.attendees;
        resultObject.offerings = event.offerings;

        return Model.Registration.findAll({
          where: {
            event_id: req.params.id
          },
          attributes: ['scout_id'],
          include: [{
            model: Model.Purchasable,
            as: 'purchases',
            attributes: ['id', 'price', 'has_size'],
            through: [{
              as: 'details',
              attributes: ['quantity', 'size']
            }]
          }]
        });
      })
      .then(function (registrations) {
        resultObject.registrations = registrations;

      //   return Model.Purchasable.findAll({
      //     where: {
      //       event_id: req.params.id
      //     },
      //     attributes: ['id', 'price', 'has_size'],
      //     include: [{
      //       model: Model.Purchase,
      //       as: 'sold',
      //       attributes: ['quantity', 'size']
      //     }]
      //   })
      // })
      // .then(function (purchases) {
      //   resultObject.purchases = purchases;
        res.status(status.OK).send(resultObject);
      })
      .catch(function (err) {
        res.status(status.BAD_REQUEST).send(err);
      });
  },
  classSize(req, res) {
    var offering;

    Model.Offering.findOne({
      where: {
        badge_id: req.params.badgeId,
        event_id: req.params.eventId
      }
    })
      .then(function (offeringFromDb) {
        offering = offeringFromDb;
        return offeringFromDb.getClassSizes()
      })
      .then(function (results) {
        res.status(status.OK).send(results);
      })
      .catch(function (err) {
        res.status(status.BAD_REQUEST).send(err);
      })
  }
};

function income(req, res, type) {
  var totalIncome = 0;

  return Model.Registration.findAll({
    where: {
      event_id: req.params.id
    }
  })
    .then(function (registrations) {
      if (registrations.length < 1) {
        throw new Error('No registrations found');
      }

      var items = _.map(registrations, function (registration) {
        return registration[type]();
      });

      return Promise.all(items);
    })
    .then(function (costs) {
      totalIncome = _.reduce(costs, function (sum, cost) {
        return sum + cost;
      }, totalIncome);

      return res.status(status.OK).json({
        income: String(totalIncome.toFixed(2))
      });
    })
    .catch(function (err) {
      return res.status(status.BAD_REQUEST).send(err);
    });
}
