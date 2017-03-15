var status = require('http-status-codes');

var Models = require('../../models');

module.exports = {
  updatePreference: function (req, res) {
    var scoutId = req.params.scoutId;
    var registrationId = req.params.registrationId;
    var offeringId = req.params.offeringId;
    var preferenceUpdate = req.body;

    return Models.Registration.find({
      where: {
        id: registrationId,
        scout_id: scoutId
      }
    })
      .then(function (registration) {
        return registration.getPreferences({
          where: {
            id: offeringId
          }
        });
      })
      .then(function (preferences) {
        if (preferences.length < 1) {
          throw new Error('No preferences found');
        } else if (preferences.length > 1) {
          throw new Error('Duplicate preferences exist');
        }

        var preference = preferences[0];
        return preference.Preference.update(preferenceUpdate);
      })
      .then(function (preference) {
        res.status(status.OK).json({
          message: 'Preference updated successfully',
          preference: preference
        });
      })
      .catch(function (err) {
        res.status(status.BAD_REQUEST).json({
          message: 'Error updating preference',
          error: err
        });
      });
  },
  updateAssignment: function (req, res) {
    var scoutId = req.params.scoutId;
    var registrationId = req.params.registrationId;
    var offeringId = req.params.offeringId;
    var assignmentUpdate = req.body;

    return Models.Registration.find({
      where: {
        id: registrationId,
        scout_id: scoutId
      }
    })
      .then(function (registration) {
        return registration.getAssignments({
          where: {
            id: offeringId
          }
        });
      })
      .then(function (assignments) {
        if (assignments.length < 1) {
          throw new Error('No assignments found');
        } else if (assignments.length > 1) {
          throw new Error('Duplicate assignments exist');
        }

        var assignment = assignments[0];
        return assignment.Assignment.update(assignmentUpdate);
      })
      .then(function (assignment) {
        res.status(status.OK).json({
          message: 'Assignment updated successfully',
          assignment: assignment
        });
      })
      .catch(function (err) {
        res.status(status.BAD_REQUEST).json({
          message: 'Error updating assignment',
          error: err
        });
      });
  },
  updatePurchase: function (req, res) {
    var scoutId = req.params.scoutId;
    var registrationId = req.params.registrationId;
    var purchasableId = req.params.purchasableId;
    var purchaseUpdate = req.body;

    return Models.Registration.find({
      where: {
        id: registrationId,
        scout_id: scoutId
      }
    })
      .then(function (registration) {
        return registration.getPurchases({
          where: {
            id: purchasableId
          }
        });
      })
      .then(function (purchases) {
        if (purchases.length < 1) {
          throw new Error('No purchase found');
        } else if (purchases.length > 1) {
          throw new Error('Duplicate purchases exist');
        }

        var purchase = purchases[0];
        return purchase.Purchase.update(purchaseUpdate);
      })
      .then(function (purchase) {
        res.status(status.OK).json({
          message: 'Purchase updated successfully',
          purchase: purchase
        });
      })
      .catch(function (err) {
        res.status(status.BAD_REQUEST).json({
          message: 'Error updating purchase',
          error: err
        });
      });
  }
};
