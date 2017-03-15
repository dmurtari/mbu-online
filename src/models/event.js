module.exports = function (sequelize, DataTypes) {
  var Event = sequelize.define('Event', {
    year: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    semester: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isIn: [['Spring', 'Fall']] }
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      unique: true
    },
    registration_open: {
      type: DataTypes.DATE,
      allowNull: false
    },
    registration_close: {
      type: DataTypes.DATE,
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false
    }
  }, {
    underscored: true
  });

  return Event;
};
