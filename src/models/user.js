var bcrypt = require('bcrypt-as-promised');
var _ = require('lodash');
var SALT_FACTOR;

if (process.env.NODE_ENV === 'test') {
  SALT_FACTOR = 1;
} else {
  SALT_FACTOR = 12;
}

module.exports = function (sequelize, DataTypes) {
  var User = sequelize.define('User', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    reset_password_token: DataTypes.STRING,
    reset_token_expires: DataTypes.DATE,
    firstname: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
      },
      allowNull: false
    },
    lastname: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
      },
      allowNull: false
    },
    role: {
      type: DataTypes.STRING,
      validate: {
        isIn: [
          ['admin', 'coordinator', 'teacher', 'anonymous']
        ]
      },
      allowNull: false,
      defaultValue: 'anonymous'
    },
    approved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    details: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {}
    }
  }, {
    indexes: [{
      unique: true,
      fields: [sequelize.fn('lower', sequelize.col('email'))]
    }],
    getterMethods: {
      fullname: function () {
        return this.firstname + ' ' + this.lastname;
      }
    },
    hooks: {
      beforeCreate: function (user) {
        return bcrypt.genSalt(SALT_FACTOR)
          .then(function (salt) {
            return bcrypt.hash(user.password, salt);
          })
          .then(function (hashedPassword) {
            return user.password = hashedPassword;
          });
      },
      beforeUpdate: function (user) {
        if (user.changed('password')) {
          return bcrypt.genSalt(SALT_FACTOR)
            .then(function (salt) {
              return bcrypt.hash(user.password, salt);
            })
            .then(function (hashedPassword) {
              return user.password = hashedPassword;
            });
        }
      }
    },
    validate: {
      areDetailsCorrect: function () {
        var allowedFields;

        if (this.role === 'coordinator') {
          allowedFields = ['troop', 'district', 'council'];
          if (!_.isEmpty(_.omit(this.details, allowedFields))) {
            throw new Error('Invalid details for coordinator');
          }
        }

        if (this.role === 'teacher') {
          allowedFields = ['chapter'];
          if (!_.isEmpty(_.omit(this.details, allowedFields))) {
            throw new Error('Invalid details for teacher');
          }
        }
      }
    },
    underscored: true
  });

  User.prototype.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  }

  return User;
};
