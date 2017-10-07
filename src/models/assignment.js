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
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: []
    }
  }, {
    underscored: true
  });

  Assignment.addHook('beforeCreate', 'ensureSizeLimit', function (assignment) {
    return sequelize.models.Offering.findById(assignment.offering_id)
      .then(function (offering) {
        return offering.getClassSizes()
      })
      .then(function (classSizes) {
        _.forEach(assignment.periods, function (period) {
          if (classSizes[period] >= classSizes.size_limit) {
            throw new Error('Offering is at the size limit for period', period);
          }
        })
      })
      .catch(function (err) {
        throw new Error('Offering is at the class limit for the given periods');
      });
  })

  return Assignment;
};
