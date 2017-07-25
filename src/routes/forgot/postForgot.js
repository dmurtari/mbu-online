var crypto = require('crypto');
var async = require('async');
var nodemailer = require('nodemailer');
var status = require('http-status-codes');

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
        var smtpTransport = nodemailer.createTransport({
          service: 'SendGrid',
          auth: {
            user: config.SENDGRID_USERNAME,
            pass: config.SENDGRID_PASSWORD
          }
        });
        var url = req.body.url || 'http://' + req.headers.host + '/api/reset/';
        var mailOptions = {
          to: user.email,
          from: 'no-reply@mbu.online',
          subject: 'MBU Online Password Reset',
          text: 'You are receiving this because you (or someone else) have requested a password reset for your account.\n\n' +
          'Please click on the following link, or paste into your browser to complete the process:\n\n' +
          url + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        };
        smtpTransport.sendMail(mailOptions, function (err) {
          if (err) {
            res.status(status.INTERNAL_SERVER_ERROR).json({ message: 'Got error' + err });
          } else {
            res.status(status.OK).json({ message: 'An e-mail has been sent to ' + user.email + ' with further instructions.' });
          }
          done(err, 'done');
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
        var smtpTransport = nodemailer.createTransport({
          service: 'SendGrid',
          auth: {
            user: config.SENDGRID_USERNAME,
            pass: config.SENDGRID_PASSWORD
          }
        });
        var mailOptions = {
          to: user.email,
          from: 'no-reply@mbu.online',
          subject: 'MBU Online Password Changed',
          text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
        };
        smtpTransport.sendMail(mailOptions, function (err) {
          if (err) {
            res.status(status.INTERNAL_SERVER_ERROR).json({ message: 'Error sending' + err });
          } else {
            res.status(status.OK).json({ message: 'Email sent' });
          }
          done(err, 'done');
        });
      }
    ], function (err) {
      if (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ message: 'Reset password failed' });
      }
    });
  }
};
