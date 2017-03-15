module.exports = function (sequelize, DataTypes) {
  var Purchase = sequelize.define('Purchase', {
    purchasable_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    registration_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    size: {
      type: DataTypes.STRING,
      validate: { isIn: [['xs', 's', 'm', 'l', 'xl', 'xxl']] }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100
      }
    }
  }, {
    underscored: true,
    validate: {
      // isInAgeRange: function () {
      //   var scout, purchasable;
      //   var registration_id = this.registration_id;
      //   var purchasable_id = this.purchasable_id;

      //   return sequelize.models.Registration.findById(registration_id)
      //     .then(function (registration) {
      //       if (!registration) {
      //         throw new Error('No registration found');
      //       }
      //       return sequelize.models.Scout.findById(registration.scout_id);
      //     })
      //     .then(function (foundScout) {
      //       if (!foundScout) {
      //         throw new Error('No scout found');
      //       }

      //       scout = foundScout;
      //       return sequelize.models.Purchasable.findById(purchasable_id);
      //     })
      //     .then(function (foundPurchasable) {
      //       purchasable = foundPurchasable;

      //       if (purchasable.maximum_age !== null && scout.age > purchasable.maximum_age) {
      //         throw new Error('Scout is older than the allowed age of this item');
      //       }
      //       if (purchasable.minimum_age !== null && scout.age < purchasable.minimum_age) {
      //         throw new Error('Scout is younger than the allowed age for this item');
      //       }
      //     });
      // }
    }
  });

  return Purchase;
};
