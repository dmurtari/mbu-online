var async = require('async');

var testEvents = require('./testEvents').events;
var testBadges = require('./testBadges').badges;
var testPurchasables = require('./testPurchasables').purchasables;

var utils = require('./testUtils');
var Models = require('../../src/models');
var scoutsGroup1 = require('./testScouts')(2);
var scoutsGroup2 = require('./testScouts')(2);

module.exports = {
  users: [],
  events: [],
  badges: [],
  troops: [],
  createPopulatedEvent: function (done) {
    async.series([
      function (cb) {
        utils.generateTokens(['admin', 'teacher', 'coordinator', 'coordinator2'], function (err, generatedTokens) {
          if (err) return done(err);
          module.exports.users = generatedTokens;
          return cb();
        });
      },
      function (cb) {
        utils.createEvents(module.exports.users.admin.token, function (err, events) {
          if (err) return done(err);
          module.exports.events = events;
          return cb();
        });
      },
      function (cb) {
        utils.createBadges(module.exports.users.admin.token, function (err, badges) {
          if (err) return done(err);
          module.exports.badges = badges;
          return cb();
        });
      },
      function (cb) {
        utils.createScoutsForUser(module.exports.users.coordinator, scoutsGroup1, module.exports.users.coordinator.token, function (err, scouts) {
          if (err) return done(err);
          module.exports.troops[module.exports.users.coordinator.profile.id] = scouts;
          return cb();
        });
      },
      function (cb) {
        utils.createScoutsForUser(module.exports.users.coordinator2, scoutsGroup2, module.exports.users.coordinator2.token, function (err, scouts) {
          if (err) return done(err);
          module.exports.troops[module.exports.users.coordinator2.profile.id] = scouts;
          return cb();
        });
      }
    ], done);
  },
  cleanEvent: function (done) {
    utils.dropTable(
      ['Scout', 'Registration', 'Offering', 'Purchase'],
      done
    );
  }
}