var crypto = require('crypto');
var async = require('async');
var status = require('http-status-codes');
var mailer = require('@sendgrid/mail');

var Models = require('../../models');
var config = require('../../config/secrets');

module.exports = {
  forgot: function (req, res, next) {
    async.waterfall([
      function (done) {
        crypto.randomBytes(20, function (err, buf) {
          var token = buf.toString('hex');
          done(err, token);
        });
      },
      function (token, done) {
        Models.User.find({
          where: {
            email: {
              ilike: req.body.email
            }
          }
        })
          .then(function (user) {
            if (!user) {
              throw new Error('User to reset not found');
            }

            user.reset_password_token = token;
            user.reset_token_expires = Date.now() + 3600000;

            return user.save();
          }).then(function (user) {
            return done(null, token, user);
          })
          .catch(function (err) {
            res.status(status.BAD_REQUEST).end();
            return done(err);
          });
      },
      function (token, user, done) {
        mailer.setApiKey(config.SENDGRID_API_KEY);
        mailer.setSubstitutionWrappers('{{', '}}');

        var url = req.body.url || 'http://' + req.headers.host + '/api/reset/';
        var msg = {
          to: user.email,
          from: 'no-reply@mbu.online',
          subject: 'MBU Online Password Reset',
          templateId: 'b6cd8257-e07c-4390-9c58-cf2267e36e20',
          substitutions: {
            url: url,
            token: token
          },
          content: [
            {
              type: "text/plain",
              value: "Textual content"
            }
          ]
        };

        return mailer.send(msg, function (error, result) {
          if (error) {
            res.status(status.INTERNAL_SERVER_ERROR).json({ message: 'Got error' + error });
          }
          else {
            res.status(status.OK).json({
              message: 'An e-mail has been sent to ' + user.email + ' with further instructions.'
            });
          }
          return done(error, 'done');
        });
      }
    ], function (err) {
      if (err) {
        return next(err);
      }
      res.status(status.OK);
    });
  },
  reset: function (req, res) {
    async.waterfall([
      function (done) {
        Models.User.find({
          where: {
            reset_password_token: req.body.token,
            reset_token_expires: { $gt: Date.now() }
          }
        })
          .then(function (user) {
            if (!user) {
              throw new Error();
            }

            user.password = req.body.password;
            user.reset_password_token = null;
            user.reset_token_expires = null;

            return user.save();
          })
          .then(function (user) {
            return done(null, user);
          })
          .catch(function (err) {
            if (err) {
              return res.status(status.INTERNAL_SERVER_ERROR).json({
                message: 'User save failed'
              });
            }
            return done(err);
          });
      },
      function (user, done) {
        mailer.setApiKey(config.SENDGRID_API_KEY);
        mailer.setSubstitutionWrappers('{{', '}}');

        var url = req.body.url || 'http://' + req.headers.host + '/api/reset/';
        var msg = {
          to: user.email,
          from: 'no-reply@mbu.online',
          subject: 'MBU Online Password Changed',
          templateId: '6822bdf9-bdb2-4359-ab1a-6f5dc9ca2d2c',
          substitutions: {
            email: user.email
          },
          content: [
            {
              type: "text/plain",
              value: "Textual content"
            }
          ]
        };

        return mailer.send(msg, function (error, result) {
          if (error) {
            res.status(status.INTERNAL_SERVER_ERROR).json({ message: 'Error sending' + error });
          } else {
            res.status(status.OK).json({ message: 'Email sent' });
          }
          done(error, 'done');
        });
      }
    ], function (err) {
      if (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ message: 'Reset password failed' });
      }
    });
  }
};
