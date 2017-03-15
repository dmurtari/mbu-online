var _ = require('lodash');

module.exports = function (sequelize, DataTypes) {
  var Registration = sequelize.define('Registration', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    event_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: 'event_registration'
    },
    scout_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: 'event_registration'
    },
    notes: {
      type: DataTypes.STRING
    }
  }, {
    underscored: true,
    getterMethods: {
      projectedCost: function () {
        var totalCost = 0;
        var registration = this;

        return registration.getPurchases()
          .then(function (purchases) {
            totalCost = _.reduce(purchases, function (sum, purchase) {
              return sum + (Number(purchase.price) * Number(purchase.Purchase.quantity));
            }, totalCost);

            return registration.getPreferences();
          })
          .then(function (preferences) {
            totalCost = _.reduce(preferences, function (sum, preference) {
              return sum + Number(preference.price);
            }, totalCost);

            return sequelize.models.Event.findById(registration.event_id);
          })
          .then(function (event) {
            totalCost += Number(event.price);
            return totalCost;
          });
      },
      actualCost: function () {
        var totalCost = 0;
        var registration = this;

        return registration.getPurchases()
          .then(function (purchases) {
            totalCost = _.reduce(purchases, function (sum, purchase) {
              return sum + (Number(purchase.price) * Number(purchase.Purchase.quantity));
            }, totalCost);

            return registration.getAssignments();
          })
          .then(function (assignments) {
            totalCost = _.reduce(assignments, function (sum, assignment) {
              return sum + Number(assignment.price);
            }, totalCost);

            return sequelize.models.Event.findById(registration.event_id);
          })
          .then(function (event) {
            totalCost += Number(event.price);
            return totalCost;
          });
      }
    }
  });

  return Registration;
};
