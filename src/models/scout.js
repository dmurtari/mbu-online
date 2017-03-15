var moment = require('moment');

module.exports = function (sequelize, DataTypes) {
  var Scout = sequelize.define('Scout', {
    firstname: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastname: {
      type: DataTypes.STRING,
      allowNull: false
    },
    birthday: {
      type: DataTypes.DATE,
      allowNull: false
    },
    troop: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    notes: {
      type: DataTypes.STRING
    },
    emergency_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    emergency_relation: {
      type: DataTypes.STRING,
      allowNull: false
    },
    emergency_phone: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    getterMethods: {
      fullname: function () {
        return this.firstname + ' ' + this.lastname;
      },
      age: function () {
        return moment().diff(moment(this.birthday), 'years');
      }
    },
    underscored: true,
    validate: {
      birthdayInThePast: function () {
        if (this.birthday && !(this.birthday < new Date())) {
          throw new Error('Birthday must be in the past');
        }
      }
    }
  });

  return Scout;
};
