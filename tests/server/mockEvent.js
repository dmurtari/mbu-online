var async = require('async');
var _ = require('lodash');
var app = require('../../src/app');
var request = require('supertest')(app);
var status = require('http-status-codes');

var testEvents = require('./testEvents').events;
var testBadges = require('./testBadges').badges;
var testPurchasables = require('./testPurchasables').purchasables;

var utils = require('./testUtils');
var Models = require('../../src/models');
var scoutsGroup1 = require('./testScouts')(4);
var scoutsGroup2 = require('./testScouts')(4);

module.exports = {
  users: [],
  events: [],
  badges: [],
  troops: [],
  offerings: [],
  purchasables: [],
  registrations: [],
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
      },
      function (cb) {
        var offeringData = {
          duration: 2,
          periods: [2, 3],
          price: 12
        }
        utils.createOfferingsForEvent(
          module.exports.events[0],
          [module.exports.badges[0]],
          offeringData,
          module.exports.users.admin.token,
          function (err, offerings) {
            if (err) return done(err);
            return cb();
          }
        );
      },
      function (cb) {
        var offeringData = {
          duration: 1,
          periods: [1, 2, 3],
          price: 5
        }
        utils.createOfferingsForEvent(
          module.exports.events[0],
          _.tail(module.exports.badges),
          offeringData,
          module.exports.users.admin.token,
          function (err, offerings) {
            if (err) return done(err);
            module.exports.offerings[module.exports.events[0].id] =_.map(offerings, 'offering');
            return cb();
          }
        );
      },
      function (cb) {
        var offeringData = {
          duration: 1,
          periods: [1, 2, 3],
          price: 0
        }
        utils.createOfferingsForEvent(
          module.exports.events[1],
          module.exports.badges,
          offeringData,
          module.exports.users.admin.token,
          function (err, offerings) {
            if (err) return done(err);
            module.exports.offerings[module.exports.events[1].id] = offerings;
            return cb();
          }
        );
      },
      function (cb) {
        utils.createPurchasablesForEvent(
          module.exports.events[0].id,
          function (err, purchasables) {
            if (err) return cb(err);
            module.exports.purchasables[module.exports.events[0].id] = purchasables;
            return cb();
          });
      },
      function (cb) {
        utils.createPurchasablesForEvent(
          module.exports.events[1].id,
          function (err, purchasables) {
            if (err) return cb(err);
            module.exports.purchasables[module.exports.events[1].id] = purchasables;
            return cb();
          });
      },
      function (cb) {
        utils.registerScoutsForEvent(
          module.exports.events[0].id,
          _.map(module.exports.troops[module.exports.users.coordinator.profile.id], 'id'),
          module.exports.users.coordinator.token,
          function (err, registrationIds) {
            if (err) return done(err);
            module.exports.registrations[module.exports.users.coordinator.profile.id] = registrationIds;
            return cb();
          }
        );
      },
      function (cb) {
        utils.registerScoutsForEvent(
          module.exports.events[0].id,
          _.map(module.exports.troops[module.exports.users.coordinator2.profile.id], 'id'),
          module.exports.users.coordinator2.token,
          function (err, registrationIds) {
            if (err) return done(err);
            module.exports.registrations[module.exports.users.coordinator2.profile.id] = registrationIds;
            return cb();
          }
        );
      },
      function (cb) {
        var eventId = module.exports.events[0].id;
        var userId = module.exports.users.coordinator.profile.id;
        var postData = [{
          offering: module.exports.offerings[eventId][0].id,
          rank: 1
        }, {
          offering: module.exports.offerings[eventId][1].id,
          rank: 2
        }];
        request.post('/api/scouts/' + module.exports.troops[userId][0].id + '/registrations/' +
          module.exports.registrations[userId][0] + '/preferences')
          .set('Authorization', module.exports.users.coordinator.token)
          .send(postData)
          .expect(status.CREATED, cb);
      },
      function (cb) {
        var eventId = module.exports.events[0].id;
        var userId = module.exports.users.coordinator.profile.id;
        var postData = [{
          offering: module.exports.offerings[eventId][1].id,
          rank: 1
        }, {
          offering: module.exports.offerings[eventId][2].id,
          rank: 2
        }];
        request.post('/api/scouts/' + module.exports.troops[userId][1].id + '/registrations/' +
          module.exports.registrations[userId][1] + '/preferences')
          .set('Authorization', module.exports.users.coordinator.token)
          .send(postData)
          .expect(status.CREATED, cb);
      },
      function (cb) {
        var eventId = module.exports.events[0].id;
        var userId = module.exports.users.coordinator2.profile.id;
        var postData = [{
          offering: module.exports.offerings[eventId][1].id,
          rank: 1
        }, {
          offering: module.exports.offerings[eventId][2].id,
          rank: 2
        }];
        request.post('/api/scouts/' + module.exports.troops[userId][1].id + '/registrations/' +
          module.exports.registrations[userId][1] + '/preferences')
          .set('Authorization', module.exports.users.coordinator2.token)
          .send(postData)
          .expect(status.CREATED, cb);
      },
      function (cb) {
        var eventId = module.exports.events[1].id;
        var userId = module.exports.users.coordinator.profile.id;
        var postData = [{
          offering: module.exports.offerings[eventId][1].id,
          rank: 1
        }, {
          offering: module.exports.offerings[eventId][2].id,
          rank: 2
        }];
        request.post('/api/scouts/' + module.exports.troops[userId][1].id + '/registrations/' +
          module.exports.registrations[userId][1] + '/preferences')
          .set('Authorization', module.exports.users.coordinator.token)
          .send(postData)
          .expect(status.CREATED, cb);
      },
      function (cb) {
        var eventId = module.exports.events[0].id;
        var userId = module.exports.users.coordinator.profile.id;
        request.post('/api/scouts/' + module.exports.troops[userId][0].id + '/registrations/' +
          module.exports.registrations[userId][0] + '/purchases')
          .set('Authorization', module.exports.users.coordinator.token)
          .send({
            purchasable: module.exports.purchasables[eventId][0].id,
            quantity: 3
          })
          .expect(status.CREATED, cb);
      },
      function (cb) {
        var eventId = module.exports.events[0].id;
        var userId = module.exports.users.coordinator.profile.id;
        request.post('/api/scouts/' + module.exports.troops[userId][1].id + '/registrations/' +
          module.exports.registrations[userId][1] + '/purchases')
          .set('Authorization', module.exports.users.coordinator.token)
          .send({
            purchasable: module.exports.purchasables[eventId][1].id,
            quantity: 2
          })
          .expect(status.CREATED, cb);
      },
      function (cb) {
        var eventId = module.exports.events[1].id;
        var userId = module.exports.users.coordinator.profile.id;
        request.post('/api/scouts/' + module.exports.troops[userId][1].id + '/registrations/' +
          module.exports.registrations[userId][1] + '/purchases')
          .set('Authorization', module.exports.users.coordinator.token)
          .send({
            purchasable: module.exports.purchasables[eventId][1].id,
            quantity: 1
          })
          .expect(status.CREATED, cb);
      },
      function (cb) {
        var eventId = module.exports.events[0].id;
        var userId = module.exports.users.coordinator2.profile.id;
        request.post('/api/scouts/' + module.exports.troops[userId][0].id + '/registrations/' +
          module.exports.registrations[userId][0] + '/purchases')
          .set('Authorization', module.exports.users.coordinator2.token)
          .send({
            purchasable: module.exports.purchasables[eventId][0].id,
            quantity: 3
          })
          .expect(status.CREATED, cb);
      },
      function (cb) {
        var eventId = module.exports.events[0].id;
        var userId = module.exports.users.coordinator.profile.id;
        request.post('/api/scouts/' + module.exports.troops[userId][0].id + '/registrations/' +
          module.exports.registrations[userId][0] + '/assignments')
          .set('Authorization', module.exports.users.admin.token)
          .send({
            periods: [1],
            offering: module.exports.offerings[eventId][1].id
          })
          .expect(status.CREATED, cb);
      },
      function (cb) {
        var eventId = module.exports.events[0].id;
        var userId = module.exports.users.coordinator.profile.id;
        request.post('/api/scouts/' + module.exports.troops[userId][0].id + '/registrations/' +
          module.exports.registrations[userId][0] + '/assignments')
          .set('Authorization', module.exports.users.admin.token)
          .send({
            periods: [2, 3],
            offering: module.exports.offerings[eventId][0].id
          })
          .expect(status.CREATED, cb);
      },
      function (cb) {
        var eventId = module.exports.events[0].id;
        var userId = module.exports.users.coordinator.profile.id;
        request.post('/api/scouts/' + module.exports.troops[userId][1].id + '/registrations/' +
          module.exports.registrations[userId][1] + '/assignments')
          .set('Authorization', module.exports.users.admin.token)
          .send({
            periods: [1],
            offering: module.exports.offerings[eventId][2].id
          })
          .expect(status.CREATED, cb);
      },
      function (cb) {
        var eventId = module.exports.events[0].id;
        var userId = module.exports.users.coordinator2.profile.id;
        request.post('/api/scouts/' + module.exports.troops[userId][1].id + '/registrations/' +
          module.exports.registrations[userId][1] + '/assignments')
          .set('Authorization', module.exports.users.admin.token)
          .send({
            periods: [1],
            offering: module.exports.offerings[eventId][2].id
          })
          .expect(status.CREATED, cb);
      },
      function (cb) {
        var eventId = module.exports.events[1].id;
        var userId = module.exports.users.coordinator.profile.id;
        request.post('/api/scouts/' + module.exports.troops[userId][0].id + '/registrations/' +
          module.exports.registrations[userId][0] + '/assignments')
          .set('Authorization', module.exports.users.admin.token)
          .send({
            periods: [2, 3],
            offering: module.exports.offerings[eventId][1].id
          })
          .expect(status.CREATED, cb);
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