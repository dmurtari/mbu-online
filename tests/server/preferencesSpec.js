var app = require('../../src/app');
var request = require('supertest')(app);
var async = require('async');
var status = require('http-status-codes');

var chai = require('chai');
var expect = chai.expect;

var utils = require('./testUtils');
var testScouts = require('./testScouts');

describe('preferences', function () {
  var badges, events;
  var generatedUsers, generatedScouts, generatedOfferings;
  var badId = utils.badId;
  var scoutId;
  var registrationIds = [];

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
    utils.createBadges(generatedUsers.admin.token, function (err, items) {
      if (err) return done(err);
      badges = items;
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
    var defaultPostData = {
      price: 10,
      periods: [1, 2, 3],
      duration: 1
    };

    utils.createOfferingsForEvent(events[0], badges, defaultPostData, generatedUsers.admin.token, function (err, offerings) {
      if (err) return done(err);
      generatedOfferings = offerings;
      return done();
    });
  });

  beforeEach(function (done) {
    utils.dropTable(['Registration'], done);
  });

  beforeEach(function (done) {
    utils.createScoutsForUser(generatedUsers.coordinator, testScouts(5), generatedUsers.coordinator.token, function (err, scouts) {
      if (err) return done(err);
      generatedScouts = scouts;
      return done();
    });
  });

  beforeEach(function (done) {
    scoutId = generatedScouts[0].id;
    registrationIds = [];
    async.series([
      function (cb) {
        request.post('/api/scouts/' + scoutId + '/registrations')
          .set('Authorization', generatedUsers.coordinator.token)
          .send({
            event_id: events[0].id
          })
          .expect(status.CREATED)
          .end(function (err, res) {
            if (err) return done(err);
            registrationIds.push(res.body.registration.id);
            return cb();
          });
      },
      function (cb) {
        request.post('/api/scouts/' + scoutId + '/registrations')
          .set('Authorization', generatedUsers.coordinator.token)
          .send({
            event_id: events[1].id
          })
          .expect(status.CREATED)
          .end(function (err, res) {
            if (err) return done(err);
            registrationIds.push(res.body.registration.id);
            return cb();
          });
      }
    ], done);
  });

  after(function (done) {
    utils.dropDb(done);
  });

  describe('when preferences do not exist', function () {
    it('should be able to be generated', function (done) {
      var postData = {
        offering: generatedOfferings[0].id,
        rank: 1
      };

      request.post('/api/scouts/' + generatedScouts[0].id + '/registrations/' +
        registrationIds[0] + '/preferences')
        .set('Authorization', generatedUsers.coordinator.token)
        .send(postData)
        .expect(status.CREATED)
        .end(function (err, res) {
          if (err) return done(err);
          var registration = res.body.registration;
          expect(registration.preferences).to.have.length(1);
          var preference = registration.preferences[0];
          expect(preference.badge_id).to.exist;
          expect(preference.offering_id).to.equal(postData.offering);
          expect(preference.details.rank).to.equal(postData.rank);
          return done();
        });
    });

    it('should check for scout owner', function (done) {
      var postData = {
        offering: generatedOfferings[0].id,
        rank: 1
      };

      request.post('/api/scouts/' + generatedScouts[0].id + '/registrations/' +
        registrationIds[0] + '/preferences')
        .set('Authorization', generatedUsers.coordinator2.token)
        .send(postData)
        .expect(status.UNAUTHORIZED, done);
    });

    it('should allow teachers to create', function (done) {
      var postData = {
        offering: generatedOfferings[0].id,
        rank: 1
      };

      request.post('/api/scouts/' + generatedScouts[0].id + '/registrations/' +
        registrationIds[0] + '/preferences')
        .set('Authorization', generatedUsers.teacher.token)
        .send(postData)
        .expect(status.CREATED, done);
    });

    it('should allow admins to create', function (done) {
      var postData = {
        offering: generatedOfferings[0].id,
        rank: 1
      };

      request.post('/api/scouts/' + generatedScouts[0].id + '/registrations/' +
        registrationIds[0] + '/preferences')
        .set('Authorization', generatedUsers.admin.token)
        .send(postData)
        .expect(status.CREATED, done);
    });

    it('should not create for a nonexistant offering', function (done) {
      var postData = {
        offering: utils.badId,
        rank: 1
      };

      request.post('/api/scouts/' + generatedScouts[0].id + '/registrations/' +
        registrationIds[0] + '/preferences')
        .set('Authorization', generatedUsers.coordinator.token)
        .send(postData)
        .expect(status.BAD_REQUEST, done);
    });

    it('should not create for nonexistant registrations', function (done) {
      var postData = {
        offering: generatedOfferings[0].id,
        rank: 1
      };

      request.post('/api/scouts/' + generatedScouts[0].id + '/registrations/' +
        utils.badId + '/preferences')
        .set('Authorization', generatedUsers.coordinator.token)
        .send(postData)
        .expect(status.BAD_REQUEST, done);
    });

    it('should not have a maximum rank of 6', function (done) {
      var postData = {
        offering: generatedOfferings[0].id,
        rank: 7
      };

      request.post('/api/scouts/' + generatedScouts[0].id + '/registrations/' +
        registrationIds[0] + '/preferences')
        .set('Authorization', generatedUsers.coordinator.token)
        .send(postData)
        .expect(status.BAD_REQUEST, done);
    });

    it('should not have a minimum rank of 1', function (done) {
      var postData = {
        offering: generatedOfferings[0].id,
        rank: 0
      };

      request.post('/api/scouts/' + generatedScouts[0].id + '/registrations/' +
        registrationIds[0] + '/preferences')
        .set('Authorization', generatedUsers.coordinator.token)
        .send(postData)
        .expect(status.BAD_REQUEST, done);
    });
  });

  describe('when preferences exist', function () {
    beforeEach(function (done) {
      async.series([
        function (cb) {
          request.post('/api/scouts/' + generatedScouts[0].id + '/registrations/' +
            registrationIds[0] + '/preferences')
            .set('Authorization', generatedUsers.coordinator.token)
            .send({
              offering: generatedOfferings[0].id,
              rank: 1
            })
            .expect(status.CREATED, cb);
        },
        function (cb) {
          request.post('/api/scouts/' + generatedScouts[0].id + '/registrations/' +
            registrationIds[0] + '/preferences')
            .set('Authorization', generatedUsers.coordinator.token)
            .send({
              offering: generatedOfferings[1].id,
              rank: 2
            })
            .expect(status.CREATED, cb);
        },
        function (cb) {
          request.post('/api/scouts/' + generatedScouts[0].id + '/registrations/' +
            registrationIds[1] + '/preferences')
            .set('Authorization', generatedUsers.coordinator.token)
            .send({
              offering: generatedOfferings[0].id,
              rank: 3
            })
            .expect(status.CREATED, cb);
        }
      ], done);
    });

    describe('getting preferences', function () {
      it('should get all preferences for a registration', function (done) {
        request.get('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/preferences')
          .set('Authorization', generatedUsers.coordinator.token)
          .expect(status.OK)
          .end(function (err, res) {
            if (err) return done(err);
            var preferences = res.body;
            expect(preferences).to.have.length(2);
            expect(preferences[0].badge_id).to.exist;
            expect(preferences[0].offering_id).to.equal(generatedOfferings[0].id);
            expect(preferences[0].details.rank).to.equal(1);
            expect(preferences[1].badge_id).to.exist;
            expect(preferences[1].offering_id).to.equal(generatedOfferings[1].id);
            expect(preferences[1].details.rank).to.equal(2);
            return done();
          });
      });

      it('should not get with an incorrect scout', function (done) {
        request.get('/api/scouts/' + badId + '/registrations/' + registrationIds[0] + '/preferences')
          .set('Authorization', generatedUsers.coordinator.token)
          .expect(status.BAD_REQUEST, done);
      });

      it('should not get with an incorrect registration', function (done) {
        request.get('/api/scouts/' + generatedScouts[0].id + '/registrations/' + badId + '/preferences')
          .set('Authorization', generatedUsers.coordinator.token)
          .expect(status.BAD_REQUEST, done);
      });
    });

    describe('updating preferences', function () {
      it('should update a preference rank', function (done) {
        async.series([
          function (cb) {
            request.get('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/preferences')
              .set('Authorization', generatedUsers.coordinator.token)
              .expect(status.OK)
              .end(function (err, res) {
                if (err) return done(err);
                expect(res.body[0].details.rank).to.equal(1);
                return cb();
              });
          },
          function (cb) {
            request.put('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/preferences/' + generatedOfferings[0].id)
              .set('Authorization', generatedUsers.coordinator.token)
              .send({
                rank: 3
              })
              .expect(status.OK, cb);
          },
          function (cb) {
            request.get('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/preferences')
              .set('Authorization', generatedUsers.coordinator.token)
              .expect(status.OK)
              .end(function (err, res) {
                if (err) return done(err);
                expect(res.body[0].details.rank).to.equal(3);
                return cb();
              });
          },
        ], done);
      });

      it('should check for the owner', function (done) {
        request.put('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/preferences/' + generatedOfferings[0].id)
          .set('Authorization', generatedUsers.coordinator2.token)
          .send({
            rank: 3
          })
          .expect(status.UNAUTHORIZED, done);
      });

      it('should allow teachers to update', function (done) {
        request.put('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/preferences/' + generatedOfferings[0].id)
          .set('Authorization', generatedUsers.teacher.token)
          .send({
            rank: 3
          })
          .expect(status.OK, done);
      });

      it('should allow admins to update', function (done) {
        request.put('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/preferences/' + generatedOfferings[0].id)
          .set('Authorization', generatedUsers.admin.token)
          .send({
            rank: 3
          })
          .expect(status.OK, done);
      });

      it('should not update an invalid preference', function (done) {
        request.put('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/preferences/' + badId)
          .set('Authorization', generatedUsers.coordinator.token)
          .expect(status.BAD_REQUEST, done);
      });

      it('should not update an invalid registration', function (done) {
        request.put('/api/scouts/' + scoutId + '/registrations/' + badId + '/preferences/' + generatedOfferings[0].id)
          .set('Authorization', generatedUsers.coordinator.token)
          .expect(status.BAD_REQUEST, done);
      });

      it('should not update for an invalid scout', function (done) {
        request.put('/api/scouts/' + badId + '/registrations/' + registrationIds[0] + '/preferences/' + generatedOfferings[0].id)
          .set('Authorization', generatedUsers.coordinator.token)
          .expect(status.BAD_REQUEST, done);
      });
    });

    describe('deleting preferences', function () {
      it('should delete an existing preference', function (done) {
        async.series([
          function (cb) {
            request.get('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/preferences')
              .set('Authorization', generatedUsers.coordinator.token)
              .expect(status.OK)
              .end(function (err, res) {
                if (err) return done(err);
                expect(res.body).to.have.length(2);
                return cb();
              });
          },
          function (cb) {
            request.del('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/preferences/' + generatedOfferings[0].id)
              .set('Authorization', generatedUsers.coordinator.token)
              .expect(status.OK, cb);
          },
          function (cb) {
            request.get('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/preferences')
              .set('Authorization', generatedUsers.coordinator.token)
              .expect(status.OK)
              .end(function (err, res) {
                expect(res.body).to.have.length(1);
                return cb();
              });
          },
        ], done);
      });

      it('should check for the correct owner', function (done) {
        request.del('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/preferences/' + generatedOfferings[0].id)
          .set('Authorization', generatedUsers.coordinator2.token)
          .expect(status.UNAUTHORIZED, done);
      });

      it('should allow teachers to delete', function (done) {
        request.del('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/preferences/' + generatedOfferings[0].id)
          .set('Authorization', generatedUsers.teacher.token)
          .expect(status.OK, done);
      });

      it('should allow admins to delete', function (done) {
        request.del('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/preferences/' + generatedOfferings[0].id)
          .set('Authorization', generatedUsers.admin.token)
          .expect(status.OK, done);
      });

      it('should not delete an invalid preference', function (done) {
        request.del('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/preferences/' + badId)
          .set('Authorization', generatedUsers.coordinator.token)
          .expect(status.BAD_REQUEST, done);
      });

      it('should not delete an invalid registration', function (done) {
        request.del('/api/scouts/' + scoutId + '/registrations/' + badId + '/preferences/' + generatedOfferings[0].id)
          .set('Authorization', generatedUsers.coordinator.token)
          .expect(status.BAD_REQUEST, done);
      });

      it('should not delete for an invalid scout', function (done) {
        request.del('/api/scouts/' + badId + '/registrations/' + registrationIds[0] + '/preferences/' + generatedOfferings[0].id)
          .set('Authorization', generatedUsers.coordinator.token)
          .expect(status.BAD_REQUEST, done);
      });
    });
  });

  describe('batch modifying preferences', function () {

    it('should add a batch of preferences', function (done) {
      var postData = [{
        offering: generatedOfferings[0].id,
        rank: 1
      }, {
        offering: generatedOfferings[1].id,
        rank: 2
      }];

      request.post('/api/scouts/' + generatedScouts[0].id + '/registrations/' +
        registrationIds[0] + '/preferences')
        .set('Authorization', generatedUsers.coordinator.token)
        .send(postData)
        .expect(status.CREATED)
        .end(function (err, res) {
          if (err) return done(err);
          var registration = res.body.registration;
          expect(registration.preferences).to.have.length(2);
          var preferences = registration.preferences;
          expect(preferences[0].badge_id).to.exist;
          expect(preferences[0].offering_id).to.equal(postData[0].offering);
          expect(preferences[0].details.rank).to.equal(postData[0].rank);
          expect(preferences[1].badge_id).to.exist;
          expect(preferences[1].offering_id).to.equal(postData[1].offering);
          expect(preferences[1].details.rank).to.equal(postData[1].rank);
          return done();
        });
    });

    it('should override existing preferences', function (done) {
      async.series([
        function (cb) {
          var postData = [{
            offering: generatedOfferings[0].id,
            rank: 1
          }, {
            offering: generatedOfferings[1].id,
            rank: 2
          }];

          request.post('/api/scouts/' + generatedScouts[0].id + '/registrations/' +
            registrationIds[0] + '/preferences')
            .set('Authorization', generatedUsers.coordinator.token)
            .send(postData)
            .expect(status.CREATED)
            .end(function (err, res) {
              if (err) return done(err);
              var registration = res.body.registration;
              expect(registration.preferences).to.have.length(2);
              var preferences = registration.preferences;
              expect(preferences[0].badge_id).to.exist;
              expect(preferences[0].offering_id).to.equal(postData[0].offering);
              expect(preferences[0].details.rank).to.equal(postData[0].rank);
              expect(preferences[1].badge_id).to.exist;
              expect(preferences[1].offering_id).to.equal(postData[1].offering);
              expect(preferences[1].details.rank).to.equal(postData[1].rank);
              return cb();
            });
        },
        function (cb) {
          var postData = [{
            offering: generatedOfferings[2].id,
            rank: 1
          }];

          request.post('/api/scouts/' + generatedScouts[0].id + '/registrations/' +
            registrationIds[0] + '/preferences')
            .set('Authorization', generatedUsers.coordinator.token)
            .send(postData)
            .expect(status.CREATED)
            .end(function (err, res) {
              if (err) return done(err);
              var registration = res.body.registration;
              expect(registration.preferences).to.have.length(1);
              var preferences = registration.preferences;
              expect(preferences[0].badge_id).to.exist;
              expect(preferences[0].offering_id).to.equal(postData[0].offering);
              expect(preferences[0].details.rank).to.equal(postData[0].rank);
              return cb();
            });
        }
      ], done);
    });

    it('should not create with an invalid offering', function (done) {
      var postData = [{
        offering: 30,
        rank: 1
      }];

      request.post('/api/scouts/' + generatedScouts[0].id + '/registrations/' +
        registrationIds[0] + '/preferences')
        .set('Authorization', generatedUsers.coordinator.token)
        .send(postData)
        .expect(status.BAD_REQUEST, done);
    });

    it('should not create with an invalid rank', function (done) {
      var postData = [{
        offering: generatedOfferings[0].id,
        rank: 30
      }];

      request.post('/api/scouts/' + generatedScouts[0].id + '/registrations/' +
        registrationIds[0] + '/preferences')
        .set('Authorization', generatedUsers.coordinator.token)
        .send(postData)
        .expect(status.BAD_REQUEST, done);
    });
  });
});
