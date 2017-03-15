var validators = require('./validators');
var _ = require('lodash');

module.exports = function (sequelize, DataTypes) {
  var Offering = sequelize.define('Offering', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 3
      }
    },
    periods: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0.0
    },
    event_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: 'event_offering'
    },
    badge_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: 'event_offering'
    }
  }, {
    validate: {
      durationPeriodRelation: function () {
        if (!validators.durationValidator(this.periods, this.duration)) {
          throw new Error('Duration validation failed');
        }
      },
    },
    hooks: {
      beforeBulkCreate: function (offerings) {
        _.forEach(offerings, function (offering) {
          offering.periods = _.without(offering.periods, null);
        });
      },
      beforeValidate: function (offering) {
        offering.periods = _.without(offering.periods, null);
      },

    },
    underscored: true
  });

  return Offering;
};
