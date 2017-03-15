var status = require('http-status-codes');
var jwt = require('jsonwebtoken');

var Models = require('../../models');
var config = require('../../config/secrets');

module.exports = {
  updateProfile: function (req, res) {
    return Models.User.findById(req.params.userId)
      .then(function (user) {
        if (!user) {
          throw new Error('Profile to update not found');
        }

        return user.update(req.body);
      })
      .then(function (user) {
        var token = jwt.sign(user.dataValues.id, config.APP_SECRET);
        delete user.dataValues['password'];
        var response = {
          message: 'User profile updated',
          profile: user
        };

        if (req.body.password) {
          response.token = 'JWT ' + token;
        }

        return res.status(status.OK).json(response);
      })
      .catch(function (err) {
        return res.status(status.BAD_REQUEST).json({
          massage: 'Error updating user',
          error: err
        });
      });
  },
  updateScout: function (req, res) {
    var scoutUpdate = req.body;
    var userId = req.params.userId;
    var scoutId = req.params.scoutId;

    return Models.User.findById(userId, {
      include: [{
        model: Models.Scout,
        as: 'scouts'
      }]
    })
      .then(function (user) {
        if (!user) {
          throw new Error('User not found');
        }

        return user.getScouts({
          where: {
            id: scoutId
          }
        });
      })
      .then(function (scouts) {
        var scout = scouts[0];
        return scout.update(scoutUpdate);
      })
      .then(function (scout) {
        return res.status(status.OK).json({
          message: 'Scout successfully updated',
          scout: scout
        });
      })
      .catch(function (err) {
        res.status(status.BAD_REQUEST).json({
          message: 'Error updating scout',
          error: err
        });
      });
  }
};










