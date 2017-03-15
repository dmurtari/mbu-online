module.exports = function(sequelize, DataTypes) {
  var Preference = sequelize.define('Preference', {
    rank: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 6
      }
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

  return Preference;
};
