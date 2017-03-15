module.exports = function (sequelize, DataTypes) {
  var Badge = sequelize.define('Badge', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    },
    description: {
      type: DataTypes.TEXT
    },
    notes: {
      type: DataTypes.STRING
    }
  }, {
    indexes: [
      {
        unique: true,
        fields: [sequelize.fn('lower', sequelize.col('name'))]
      }
    ],
    underscored: true
  });

  return Badge;
};
