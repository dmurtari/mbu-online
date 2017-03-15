module.exports = function (sequelize, DataTypes) {
  var Purchasable = sequelize.define('Purchasable', {
    item: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING
    },
    has_size: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    price: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false
    },
    maximum_age: {
      type: DataTypes.INTEGER
    },
    minimum_age: {
      type: DataTypes.INTEGER
    }
  }, {
    underscored: true,
    validate: {
      maxGreaterThanMin: function () {
        if (this.maximum_age && this.minimum_age && (this.maximum_age < this.minimum_age)) {
          throw new Error('Max age must be greater than min');
        }
      }
    }
  });

  return Purchasable;
};
