var _ = require('lodash');

module.exports = function (sequelize, DataTypes) {
  var Assignment = sequelize.define('Assignment', {
    periods: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      allowNull: false
    },
    offering_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    registration_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    completions: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {}
    }
  }, {
      underscored: true,
      hooks: {
        beforeCreate: function (assignment) {
          return sequelize.models.Offering.findById(assignment.offering_id)
            .then(function (offering) {
              var completions = _.reduce(offering.requirements, function (result, requirement) {
                result[requirement] = false;
                return result;
              }, {});

              return assignment.completions = completions;
            })
        }
      }
  });

  return Assignment;
};
