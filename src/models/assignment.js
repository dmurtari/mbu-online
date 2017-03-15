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
    }
  }, {
      underscored: true
    });

  return Assignment;
};
