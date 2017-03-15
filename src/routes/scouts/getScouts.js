var status = require('http-status-codes');

var Models = require('../../models');
var registrationInformation = require('../../models/queries/registrationInformation');

module.exports = {
  getRegistrations: function (req, res) {
    var query = registrationInformation;
    var scoutId = req.params.scoutId;

    query.where = {
      scout_id: scoutId
    };

    Models.Registration.findAll(query)
      .then(function (registrations) {
        res.status(status.OK).json(registrations);
      })
      .catch(function (err) {
        res.status(status.BAD_REQUEST).json({
          message: 'Could not get registration for scout ' + scoutId,
          error: err
        });
      });
  },
  getPreferences: function (req, res) {
    getRegistrationDetails(req, res, 'preferences');
  },
  getAssignments: function (req, res) {
    getRegistrationDetails(req, res, 'assignments');
  },
  getPurchases: function (req, res) {
    getRegistrationDetails(req, res, 'purchases');
  },
  getProjectedCost: function (req, res) {
    getCost(req, res, 'projectedCost');
  },
  getActualCost: function (req, res) {
    getCost(req, res, 'actualCost');
  }
};

function getRegistrationDetails(req, res, object) {
  var scoutId = req.params.scoutId;
  var registrationId = req.params.registrationId;

  var possibleQueries = {
    'preferences': {
      model: Models.Offering,
      modelAttributes: ['badge_id', ['id', 'offering_id']],
      joinAttributes: ['rank']
    },
    'assignments': {
      model: Models.Offering,
      modelAttributes: ['badge_id', ['id', 'offering_id']],
      joinAttributes: ['periods']
    },
    'purchases': {
      model: Models.Purchasable,
      joinAttributes: ['quantity', 'size']
    }
  };

  if (object in possibleQueries) {
    return Models.Registration.find({
      where: {
        id: registrationId,
        scout_id: scoutId
      },
      include: [{
        model: possibleQueries[object].model,
        as: object,
        attributes: possibleQueries[object].modelAttributes,
        through: {
          as: 'details',
          attributes: possibleQueries[object].joinAttributes
        }
      }]
    })
      .then(function (registration) {
        res.status(status.OK).json(registration[object]);
      })
      .catch(function () {
        res.status(status.BAD_REQUEST).end();
      });
  } else {
    return res.status(status.INTERNAL_SERVER_ERROR);
  }
}

function getCost(req, res, type) {
  var scoutId = req.params.scoutId;
  var registrationId = req.params.registrationId;

  return Models.Registration.find({
    where: {
      id: registrationId,
      scout_id: scoutId
    }
  })
    .then(function (registration) {
      return registration[type];
    })
    .then(function (cost) {
      res.status(status.OK).json({
        cost: String(cost.toFixed(2))
      });
    })
    .catch(function () {
      res.status(status.BAD_REQUEST).end();
    });
}
