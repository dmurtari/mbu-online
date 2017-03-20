var app = require('../../src/app');
var request = require('supertest')(app);
var async = require('async');
var status = require('http-status-codes');
var _ = require('lodash');

var chai = require('chai');
var expect = chai.expect;

var utils = require('./testUtils');
var testScouts = require('./testScouts');

describe.only('using preference and assignments', function () {
  var generatedUsers, generatedScouts, generatedBadges, generatedOfferings,
    events, purchasables;
  var preferences = {};
  var badId = utils.badId;

  before(function (done) {
    utils.dropDb(done);
  });

  before(function (done) {
    this.timeout(10000);
    utils.generateTokens(['admin', 'teacher', 'coordinator', 'coordinator2'], function (err, generatedTokens) {
      if (err) return done(err);
      generatedUsers = generatedTokens;
      return done();
    });
  });

  before(function (done) {
    utils.createEvents(generatedUsers.admin.token, function (err, items) {
      if (err) return done(err);
      events = items;
      return done();
    });
  });

  before(function (done) {
    utils.createBadges(generatedUsers.admin.token, function (err, badges) {
      if (err) return done(err);
      generatedBadges = badges;
      return done();
    });
  });

  before(function (done) {
    var defaultPostData = {
      price: 10,
      periods: [1, 2, 3],
      duration: 1
    };

    utils.createOfferingsForEvent(events[0], generatedBadges, defaultPostData, generatedUsers.admin.token, function (err, offerings) {
      if (err) return done(err);
      generatedOfferings = offerings;
      return done();
    });
  });

  before(function (done) {
    utils.createScoutsForUser(generatedUsers.coordinator, testScouts(5), generatedUsers.coordinator.token, function (err, scouts) {
      if (err) return done(err);
      generatedScouts = scouts;
      return done();
    });
  });

  before(function (done) {
    utils.createScoutsForUser(generatedUsers.coordinator2, testScouts(5), generatedUsers.coordinator2.token, function (err, scouts) {
      if (err) return done(err);
      return done();
    });
  });

  before(function (done) {
    utils.createPurchasablesForEvent(events[0].id, function (err, items) {
      if (err) return done(err);
      purchasables = items;
      return done();
    });
  });

  before(function (done) {
    var postData = [{
      offering: generatedOfferings[0].id,
      rank: 1
    }, {
      offering: generatedOfferings[1].id,
      rank: 2
    }];

    async.forEachOfSeries(generatedScouts, function (scout, index, cb) {
      var registrationId;

      async.series([
        function (next) {
          request.post('/api/scouts/' + scout.id + '/registrations')
            .set('Authorization', generatedUsers.coordinator.token)
            .send({ event_id: events[0].id })
            .expect(status.CREATED)
            .end(function (err, res) {
              if (err) return done(err);
              registrationId = res.body.registration.id;
              return next();
            });
        },
        function (next) {
          request.post('/api/scouts/' + scout.id + '/registrations/' + registrationId + '/purchases')
            .set('Authorization', generatedUsers.coordinator.token)
            .send({
              purchasable: purchasables[0].id,
              quantity: 2,
              size: 'l'
            })
            .expect(status.CREATED, next);
        },
        function (next) {
          request.post('/api/scouts/' + scout.id + '/registrations/' + registrationId + '/preferences')
            .set('Authorization', generatedUsers.admin.token)
            .send(postData)
            .expect(status.CREATED)
            .end(function (err, res) {
              if (err) return done(err);
              preferences[registrationId] = res.body.registration.preferences;
              return next();
            });
        },
        function (next) {
          var postData = [{
            periods: [1],
            offering: generatedOfferings[0].id
          }, {
            periods: [2, 3],
            offering: generatedOfferings[1].id
          }];

          request.post('/api/scouts/' + scout.id + '/registrations/' + registrationId + '/assignments')
            .set('Authorization', generatedUsers.admin.token)
            .send(postData)
            .expect(status.CREATED, next);
        }
      ], cb);
    }, done);
  });

  after(function (done) {
    utils.dropDb(done);
  });

  describe('getting scouts that are registered for an event', function () {

    it('should get all registrations for an event', function (done) {
      request.get('/api/events/' + events[0].id + '/registrations')
        .set('Authorization', generatedUsers.admin.token)
        .expect(status.OK)
        .end(function (err, res) {
          if (err) return done(err);
          _.forEach(res.body, function (registration) {
            expect(registration.scout_id).to.exist;
            expect(registration.scout).to.exist;
            expect(registration.scout.firstname).to.exist;
            expect(registration.scout.lastname).to.exist;
            expect(registration.scout.troop).to.exist;
            expect(registration.preferences).to.have.lengthOf(2);
            expect(registration.assignments).to.have.lengthOf(2);
            expect(registration.purchases).to.have.lengthOf(1);

            _.forEach(registration.preferences, function (preference) {
              expect(preference.badge.name).to.exist;
              expect(preference.details.rank).to.exist;
            });

            _.forEach(registration.purchases, function (purchase) {
              expect(purchase.item).to.exist;
              expect(purchase.price).to.exist;
              expect(purchase.details.quantity).to.exist;
              expect(purchase.details.size).to.exist;
            });

            _.forEach(registration.assignments, function (assignment) {
              expect(assignment.badge.name).to.exist;
              expect(assignment.details.periods).to.exist;
              expect(assignment.price).to.exist;
            });
          });
          return done();
        });
    });

    it('should allow teachers to see registrations', function (done) {
      request.get('/api/events/' + events[0].id + '/registrations')
        .set('Authorization', generatedUsers.teacher.token)
        .expect(status.OK, done);
    });

    it('should not allow coordinators to see registrations', function (done) {
      request.get('/api/events/' + events[0].id + '/registrations')
        .set('Authorization', generatedUsers.coordinator.token)
        .expect(status.UNAUTHORIZED, done);
    });

    it('should fail gracefully for a bad id', function (done) {
      request.get('/api/events/' + badId + '/registrations')
        .set('Authorization', generatedUsers.teacher.token)
        .expect(status.OK, done);
    });
  });

  describe('getting all scouts and all registrations', function (done) {
    it('should get all scouts of the site', function (done) {
      request.get('/api/scouts')
        .set('Authorization', generatedUsers.admin.token)
        .expect(status.OK)
        .end(function (err, res) {
          if (err) return done(err);
          var scouts = res.body;
          expect(scouts).to.have.lengthOf(10);
          _.forEach(scouts, function (scout) {
            expect(scout.firstname).to.exist;
            expect(scout.lastname).to.exist;
            expect(scout.troop).to.exist;
            expect(scout.emergency_name).to.exist;
            expect(scout.emergency_phone).to.exist;
            expect(scout.emergency_relation).to.exist;
            expect(scout.notes).to.exist;
            expect(scout.registrations).to.exist;
            expect(scout.user).to.exist;
          });
          return done();
        });
    });

    it('should get some details of the registration', function (done) {
      request.get('/api/scouts')
        .set('Authorization', generatedUsers.admin.token)
        .expect(status.OK)
        .end(function (err, res) {
          if (err) return done(err);
          var scouts = res.body;
          expect(scouts).to.have.lengthOf(10);
          _.forEach(scouts, function (scout) {
            _.forEach(scout.registrations, function (registration) {
              expect(registration.registration_id).to.exist;
              expect(registration.event_id).to.exist;
              expect(registration.assignments).to.exist;
              expect(registration.purchases).to.exist;
            });
          });
          return done();
        });
    });

    it('should get some details of the user', function (done) {
      request.get('/api/scouts')
        .set('Authorization', generatedUsers.admin.token)
        .expect(status.OK)
        .end(function (err, res) {
          if (err) return done(err);
          var scouts = res.body;
          expect(scouts).to.have.lengthOf(10);
          _.forEach(scouts, function (scout) {
            expect(scout.user.fullname).to.exist;
            expect(scout.user.email).to.exist;
            expect(scout.user.user_id).to.exist;
          });
          return done();
        });
    });

    it('should allow teachers to get a list of scouts', function (done) {
      request.get('/api/scouts')
        .set('Authorization', generatedUsers.teacher.token)
        .expect(status.OK, done);
    });

    it('should not allow coordinators to access', function (done) {
      request.get('/api/scouts')
        .set('Authorization', generatedUsers.coordinator.token)
        .expect(status.UNAUTHORIZED, done);
    })
  });
});