var app = require('../../src/app');
var request = require('supertest')(app);
var async = require('async');
var status = require('http-status-codes');

var chai = require('chai');
var expect = chai.expect;

var utils = require('./testUtils');
var testScouts = require('./testScouts');

describe('Assignments and registrations', function () {
  var badges, events;
  var generatedUsers, generatedTroop2, generatedTroop2, generatedOfferings;
  var scoutId;
  var troop1Registrations = [];
  var troop2Registrations = [];
  var badId = '123456789012345678901234';

  before(function (done) {
    utils.dropDb(done);
  });

  beforeEach(function (done) {
    troop1Registrations = [];
    troop2Registrations = [];
    utils.dropTable(['Event', 'Offering', 'Badge', 'Assignment', 'Registration', 'Scout'], done);
  });

  before(function (done) {
    this.timeout(10000);
    utils.generateTokens(['admin', 'teacher', 'coordinator', 'coordinator1'], function (err, generatedTokens) {
      if (err) return done(err);
      generatedUsers = generatedTokens;
      return done();
    });
  });

  beforeEach(function (done) {
    badges = [];
    utils.createBadges(generatedUsers.admin.token, function (err, items) {
      if (err) return done(err);
      badges = items;
      return done();
    });
  });

  beforeEach(function (done) {
    events = [];
    utils.createEvents(generatedUsers.admin.token, function (err, items) {

      if (err) return done(err);
      events = items;
      return done();
    });
  });

  beforeEach(function (done) {
    var defaultPostData = {
      price: 10,
      periods: [1, 2, 3],
      duration: 1,
      requirements: ['1', '2', '3']
    };

    utils.createOfferingsForEvent(events[0], badges, defaultPostData, generatedUsers.admin.token, function (err, offerings) {
      if (err) return done(err);
      generatedOfferings = offerings;
      return done();
    });
  });


  beforeEach(function (done) {
    generatedTroop1 = [];
    utils.createScoutsForUser(generatedUsers.coordinator, testScouts(5), generatedUsers.coordinator.token, function (err, scouts) {
      if (err) return done(err);
      generatedTroop1 = scouts;
      return done();
    });
  });

  beforeEach(function (done) {
    generatedTroop2 = [];
    utils.createScoutsForUser(generatedUsers.coordinator1, testScouts(5), generatedUsers.coordinator1.token, function (err, scouts) {
      if (err) return done(err);
      generatedTroop2 = scouts;
      return done();
    });
  });

  after(function (done) {
    utils.dropDb(done);
  });

  describe('when a group of scouts has been registered', function (done) {
    beforeEach(function (done) {
      async.forEachOfSeries(generatedTroop1, function (scout, index, cb) {
        request.post('/api/scouts/' + scout.id + '/registrations')
          .set('Authorization', generatedUsers.coordinator.token)
          .send({
            event_id: events[0].id
          })
          .expect(status.CREATED)
          .end(function (err, res) {
            if (err) return done(err);
            troop1Registrations.push(res.body.registration.id);
            return cb();
          });
      }, function (err) {
        done(err);
      });
    });

    it('should contain the correct registrations', function (done) {
      request.get('/api/events/' + events[0].id + '/registrations')
        .set('Authorization', generatedUsers.admin.token)
        .expect(status.OK)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body).to.have.lengthOf(5);
          return done();
        });
    });

    describe('and another group of scouts is registered', function (done) {
      beforeEach(function (done) {
        async.forEachOfSeries(generatedTroop2, function (scout, index, cb) {
          request.post('/api/scouts/' + scout.id + '/registrations')
            .set('Authorization', generatedUsers.coordinator1.token)
            .send({
              event_id: events[0].id
            })
            .expect(status.CREATED)
            .end(function (err, res) {
              if (err) return done(err);
              troop2Registrations.push(res.body.registration.id);
              return cb();
            });
        }, function (err) {
          done(err);
        });
      });

      it('should contain the correct registrations', function (done) {
        request.get('/api/events/' + events[0].id + '/registrations')
          .set('Authorization', generatedUsers.admin.token)
          .expect(status.OK)
          .end(function (err, res) {
            if (err) return done(err);
            expect(res.body).to.have.lengthOf(10);
            return done();
          });
      });

      describe('and a coordinator requests registration information', function (done) {
        beforeEach(function (done) {
          request.get('/api/users/' + generatedUsers.coordinator1.profile.id + '/events/' + events[0].id + '/registrations')
            .set('Authorization', generatedUsers.coordinator1.token)
            .expect(status.OK, done);
        });

        it('should contain the correct registrations', function (done) {
          request.get('/api/events/' + events[0].id + '/registrations')
            .set('Authorization', generatedUsers.admin.token)
            .expect(status.OK)
            .end(function (err, res) {
              if (err) return done(err);
              expect(res.body).to.have.lengthOf(10);
              return done();
            });
        });
      });
    });

    describe('and they have been assigned to classes', function (done) {
      beforeEach(function (done) {
        async.forEachOfSeries(generatedTroop1, function (scout, index, cb) {
          request.post('/api/scouts/' + scout.id + '/registrations/' +
            troop1Registrations[index] + '/assignments')
            .set('Authorization', generatedUsers.teacher.token)
            .send({
              offering: generatedOfferings[0].id,
              periods: [1]
            })
            .expect(status.CREATED, cb);
        }, function (err) {
          done(err);
        });
      });

      it('should contain the correct registrations', function (done) {
        request.get('/api/events/' + events[0].id + '/registrations')
          .set('Authorization', generatedUsers.admin.token)
          .expect(status.OK)
          .end(function (err, res) {
            if (err) return done(err);
            expect(res.body).to.have.lengthOf(5);
            return done();
          });
      });

      describe('and another group of scouts is registered', function (done) {
        beforeEach(function (done) {
          async.forEachOfSeries(generatedTroop2, function (scout, index, cb) {
            request.post('/api/scouts/' + scout.id + '/registrations')
              .set('Authorization', generatedUsers.coordinator1.token)
              .send({
                event_id: events[0].id
              })
              .expect(status.CREATED)
              .end(function (err, res) {
                if (err) return done(err);
                troop2Registrations.push(res.body.registration.id);
                return cb();
              });
          }, function (err) {
            done(err);
          });
        });

        it('should contain the correct registrations', function (done) {
          request.get('/api/events/' + events[0].id + '/registrations')
            .set('Authorization', generatedUsers.admin.token)
            .expect(status.OK)
            .end(function (err, res) {
              if (err) return done(err);
              expect(res.body).to.have.lengthOf(10);
              return done();
            });
        });
      });
    });
  });
});

