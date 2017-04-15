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

  return Assignment;
};
