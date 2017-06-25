var status = require('http-status-codes');
var _ = require('lodash');

var Models = require('../../models');

module.exports = {
  createRegistration: function (req, res) {
    var scoutId = req.params.scoutId;
    var scout;

    Models.Scout.findById(scoutId)
      .then(function (foundScout) {
        scout = foundScout;
        return Models.Registration.create({
          scout_id: scoutId,
          event_id: req.body.event_id,
          notes: req.body.notes
        });
      })
      .then(function (registration) {
        return res.status(status.CREATED).json({
          message: 'Scout successfully registered for event',
          registration: registration
        });
      })
      .catch(function (err) {
        return res.status(status.BAD_REQUEST).json({
          message: 'Registration could not be created',
          error: err
        });
      });
  },
  createPreference: function (req, res) {
    var scoutId = req.params.scoutId;
    var registrationId = req.params.registrationId;

    return Models.Registration.find({
      where: {
        id: registrationId,
        scout_id: scoutId
      }
    })
      .then(function (registration) {
        if (Array.isArray(req.body)) {
          // Update preferences, override existing
          return Models.Preference.destroy({ where: { registration_id: registrationId } })
            .then(function () {
              var preferences = _.map(req.body, function (preference) {
                return {
                  registration_id: registrationId,
                  offering_id: preference.offering,
                  rank: preference.rank
                };
              });
              return Models.Preference.bulkCreate(preferences, {
                validate: true,
                individualHooks: true
              });
            })
            .catch(function (err) {
              throw new Error('Failed to destroy existing preferences');
            });
        } else {
          // Add preference, without overriding
          return registration.addPreference(req.body.offering, {
            rank: req.body.rank
          });
        }
      })
      .then(function () {
        return Models.Registration.findById(registrationId, {
          include: [{
            model: Models.Offering,
            as: 'preferences',
            attributes: ['badge_id', ['id', 'offering_id']],
            through: {
              as: 'details',
              attributes: ['rank']
            }
          }]
        });
      })
      .then(function (registration) {
        res.status(status.CREATED).json({
          message: 'Preference created with rank ' + req.body.rank,
          registration: registration
        });
      })
      .catch(function (err) {
        res.status(status.BAD_REQUEST).json({
          message: 'Preference could not be created',
          error: err
        });
      });
  },
  createAssignment: function (req, res) {
    var scoutId = req.params.scoutId;
    var registrationId = req.params.registrationId;

    return Models.Registration.find({
      where: {
        id: registrationId,
        scout_id: scoutId
      }
    })
      .then(function (registration) {
        if (Array.isArray(req.body)) {
          // Update assignments, override existing
          return Models.Assignment.destroy({ where: { registration_id: registrationId } })
            .then(function () {
              var assignments = _.map(req.body, function (assignment) {
                return {
                  registration_id: registrationId,
                  offering_id: assignment.offering,
                  periods: assignment.periods
                };
              });

              return Models.Assignment.bulkCreate(assignments, {
                validate: true,
                individualHooks: true
              });
            })
            .catch(function () {
              throw new Error('Failed to destroy existing assignments');
            });
        } else {
          // Add assignment, without overriding
          return registration.addAssignment(req.body.offering, {
            individualHooks: true,
            periods: req.body.periods
          });
        }
      })
      .then(function () {
        return Models.Registration.findById(registrationId, {
          include: [{
            model: Models.Offering,
            as: 'assignments',
            attributes: ['badge_id', ['id', 'offering_id'], 'price'],
            through: {
              as: 'details',
              attributes: ['periods', 'completions']
            },
            include: [{
              model: Models.Badge,
              as: 'badge',
              attributes: ['name']
            }]
          }]
        });
      })
      .then(function (registration) {
        res.status(status.CREATED).json({
          message: 'Assignment created for period(s) ' + req.body.periods,
          registration: registration
        });
      })
      .catch(function (err) {
        res.status(status.BAD_REQUEST).json({
          message: 'Assignment could not be created',
          error: err
        });
      });
  },
  createPurchase: function (req, res) {
    var scoutId = req.params.scoutId;
    var registrationId = req.params.registrationId;

    return Models.Registration.find({
      where: {
        id: registrationId,
        scout_id: scoutId
      }
    })
      .then(function (registration) {
        return registration.addPurchase(req.body.purchasable, {
          quantity: req.body.quantity,
          size: req.body.size
        });
      })
      .then(function () {
        return Models.Registration.findById(registrationId, {
          include: [{
            model: Models.Purchasable,
            as: 'purchases',
            through: {
              as: 'details',
              attributes: ['size', 'quantity']
            }
          }]
        });
      })
      .then(function (registration) {
        res.status(status.CREATED).json({
          message: 'Purchase created',
          registration: registration
        });
      })
      .catch(function (err) {
        res.status(status.BAD_REQUEST).json({
          message: 'Purchase could not be created',
          error: err
        });
      });
  }
};
