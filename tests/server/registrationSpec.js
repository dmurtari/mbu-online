var app = require('../../src/app');
var request = require('supertest')(app);
var async = require('async');
var status = require('http-status-codes');
var _ = require('lodash');

var chai = require('chai');
var expect = chai.expect;

var utils = require('./testUtils');
var testScouts = require('./testScouts');

describe('registration', function () {
  var events;
  var generatedUsers, generatedScouts;
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

  beforeEach(function (done) {
    utils.dropTable(['Registration', 'Scout'], done);
  });

  before(function (done) {
    utils.createEvents(generatedUsers.admin.token, function (err, items) {
      if (err) return done(err);
      events = items;
      return done();
    });
  });

  beforeEach(function (done) {
    utils.createScoutsForUser(generatedUsers.coordinator, testScouts(5), generatedUsers.coordinator.token, function (err, scouts) {
      if (err) return done(err);
      generatedScouts = scouts;
      return done();
    });
  });

  after(function (done) {
    utils.dropDb(done);
  });

  describe('registering a scout for an event', function () {
    it('should create the registration', function (done) {
      request.post('/api/scouts/' + generatedScouts[3].id + '/registrations')
        .set('Authorization', generatedUsers.coordinator.token)
        .send({
          event_id: events[0].id
        })
        .expect(status.CREATED)
        .end(function (err, res) {
          if (err) return done(err);
          var registration = res.body.registration;
          expect(registration.scout_id).to.equal(generatedScouts[3].id);
          expect(registration.event_id).to.equal(events[0].id);
          return done();
        });
    });

    it('should create a registration with a note', function (done) {
      var note = 'This is a note';

      request.post('/api/scouts/' + generatedScouts[3].id + '/registrations')
        .set('Authorization', generatedUsers.coordinator.token)
        .send({
          event_id: events[0].id,
          notes: note
        })
        .expect(status.CREATED)
        .end(function (err, res) {
          if (err) return done(err);
          var registration = res.body.registration;
          expect(registration.scout_id).to.equal(generatedScouts[3].id);
          expect(registration.event_id).to.equal(events[0].id);
          expect(registration.notes).to.equal(note);
          return done();
        });
    });

    it('should check for the correct owner', function (done) {
      request.post('/api/scouts/' + generatedScouts[3].id + '/registrations')
        .set('Authorization', generatedUsers.coordinator2.token)
        .send({
          event_id: events[0].id
        })
        .expect(status.UNAUTHORIZED, done);
    });

    it('should allow admins to register', function (done) {
      request.post('/api/scouts/' + generatedScouts[3].id + '/registrations')
        .set('Authorization', generatedUsers.admin.token)
        .send({
          event_id: events[0].id
        })
        .expect(status.CREATED, done);
    });

    it('should allow teachers to register', function (done) {
      request.post('/api/scouts/' + generatedScouts[3].id + '/registrations')
        .set('Authorization', generatedUsers.teacher.token)
        .send({
          event_id: events[0].id
        })
        .expect(status.CREATED, done);
    });

    it('should not create a registration for a nonexistant scout', function (done) {
      request.post('/api/scouts/' + badId + '/registrations')
        .set('Authorization', generatedUsers.coordinator.token)
        .send({
          event_id: events[0].id
        })
        .expect(status.BAD_REQUEST, done);
    });

    it('should not create a registration for a nonexistant event', function (done) {
      request.post('/api/scouts/' + generatedScouts[3].id + '/registrations')
        .set('Authorization', generatedUsers.coordinator.token)
        .send({
          event_id: badId
        })
        .expect(status.BAD_REQUEST, done);
    });

    it('should not create duplicate registrations', function (done) {
      async.series([
        function (cb) {
          request.post('/api/scouts/' + generatedScouts[3].id + '/registrations')
            .set('Authorization', generatedUsers.coordinator.token)
            .send({
              event_id: events[0].id
            })
            .expect(status.CREATED, cb);
        },
        function (cb) {
          request.post('/api/scouts/' + generatedScouts[3].id + '/registrations')
            .set('Authorization', generatedUsers.coordinator.token)
            .send({
              event_id: events[0].id
            })
            .expect(status.BAD_REQUEST, cb);
        }
      ], done);
    });
  });

  describe('when a scout is already registered for events', function () {
    var scoutId;

    beforeEach(function (done) {
      scoutId = generatedScouts[3].id;
      async.series([
        function (cb) {
          request.post('/api/scouts/' + generatedScouts[1].id + '/registrations')
            .set('Authorization', generatedUsers.coordinator.token)
            .send({
              event_id: events[0].id
            })
            .expect(status.CREATED, cb);
        },
        function (cb) {
          request.post('/api/scouts/' + generatedScouts[1].id + '/registrations')
            .set('Authorization', generatedUsers.coordinator.token)
            .send({
              event_id: events[1].id
            })
            .expect(status.CREATED, cb);
        },
        function (cb) {
          request.post('/api/scouts/' + scoutId + '/registrations')
            .set('Authorization', generatedUsers.coordinator.token)
            .send({
              event_id: events[0].id
            })
            .expect(status.CREATED, cb);
        },
        function (cb) {
          request.post('/api/scouts/' + scoutId + '/registrations')
            .set('Authorization', generatedUsers.coordinator.token)
            .send({
              event_id: events[1].id
            })
            .expect(status.CREATED, cb);
        },
        function (cb) {
          request.post('/api/scouts/' + generatedScouts[2].id + '/registrations')
            .set('Authorization', generatedUsers.coordinator.token)
            .send({
              event_id: events[0].id
            })
            .expect(status.CREATED, cb);
        }
      ], done);
    });

    describe('getting a scouts registrations', function () {
      it('should get all associated registrations', function (done) {
        request.get('/api/scouts/' + scoutId + '/registrations')
          .set('Authorization', generatedUsers.coordinator.token)
          .expect(status.OK)
          .end(function (err, res) {
            if (err) return done(err);
            var registrations = res.body;
            expect(registrations).to.have.lengthOf(2);
            expect(registrations[0].event_id).to.equal(events[1].id);
            expect(registrations[1].event_id).to.equal(events[0].id);

            _.forEach(registrations, (registration) => {
              expect(registration.preferences).to.be.a('array');
              expect(registration.purchases).to.be.a('array');
              expect(registration.assignments).to.be.a('array');
            });

            return done();
          });
      });
    });

    describe('deleting a registation', function () {
      it('should delete a single registration', function (done) {
        async.series([
          function (cb) {
            request.del('/api/scouts/' + scoutId + '/registrations/' + events[0].id)
              .set('Authorization', generatedUsers.coordinator.token)
              .expect(status.OK, cb);
          },
          function (cb) {
            request.get('/api/scouts/' + scoutId + '/registrations')
              .set('Authorization', generatedUsers.coordinator.token)
              .expect(status.OK)
              .end(function (err, res) {
                if (err) return cb(err);
                var registrations = res.body;
                expect(registrations).to.have.length(1);
                expect(registrations[0].event_id).to.equal(events[1].id);
                return cb();
              });
          }
        ], done);
      });

      it('should check for the correct owner', function (done) {
        request.del('/api/scouts/' + scoutId + '/registrations/' + events[0].id)
          .set('Authorization', generatedUsers.coordinator2.token)
          .expect(status.UNAUTHORIZED, done);
      });

      it('should allow teachers to delete', function (done) {
        request.del('/api/scouts/' + scoutId + '/registrations/' + events[0].id)
          .set('Authorization', generatedUsers.teacher.token)
          .expect(status.OK, done);
      });

      it('should allow admins to delete', function (done) {
        request.del('/api/scouts/' + scoutId + '/registrations/' + events[0].id)
          .set('Authorization', generatedUsers.admin.token)
          .expect(status.OK, done);
      });

      it('should not delete for an invalid scout', function (done) {
        request.del('/api/scouts/' + badId + '/registrations/' + events[0].id)
          .set('Authorization', generatedUsers.coordinator.token)
          .expect(status.BAD_REQUEST, done);
      });

      it('should handle invalid events', function (done) {
        request.del('/api/scouts/' + scoutId + '/registrations/' + badId)
          .set('Authorization', generatedUsers.coordinator.token)
          .expect(status.BAD_REQUEST, done);
      });
    });
  });

  describe('when multiple scouts are registered for an event', function () {
    var generatedScouts2;

    beforeEach(function (done) {
      utils.createScoutsForUser(generatedUsers.coordinator2, testScouts(5), generatedUsers.coordinator2.token, function (err, scouts) {
        if (err) return done(err);
        generatedScouts2 = scouts;
        return done();
      });
    });

    beforeEach(function (done) {
      async.forEachOfSeries(generatedScouts, function (scout, index, cb) {
        request.post('/api/scouts/' + scout.id + '/registrations')
          .set('Authorization', generatedUsers.coordinator.token)
          .send({
            event_id: events[0].id
          })
          .expect(status.CREATED, cb);
      }, function (err) {
        done(err);
      });
    });

    beforeEach(function (done) {
      async.forEachOfSeries(generatedScouts, function (scout, index, cb) {
        request.post('/api/scouts/' + scout.id + '/registrations')
          .set('Authorization', generatedUsers.coordinator.token)
          .send({
            event_id: events[1].id
          })
          .expect(status.CREATED, cb);
      }, function (err) {
        done(err);
      });
    });

    beforeEach(function (done) {
      async.forEachOfSeries(generatedScouts2, function (scout, index, cb) {
        request.post('/api/scouts/' + scout.id + '/registrations')
          .set('Authorization', generatedUsers.coordinator2.token)
          .send({
            event_id: events[0].id
          })
          .expect(status.CREATED, cb);
      }, function (err) {
        done(err);
      });
    });

    it('should get scout registrations for a user', function (done) {
      request.get('/api/users/' + generatedUsers.coordinator.profile.id + '/scouts/registrations')
        .set('Authorization', generatedUsers.coordinator.token)
        .expect(status.OK)
        .end(function (err, res) {
          if (err) return done(err);
          var scouts = res.body;
          expect(scouts).to.have.lengthOf(5);
          _.forEach(scouts, function (scout) {
            expect(scout.registrations).to.have.lengthOf(2);
            expect(scout.registrations[0].event_id).to.equal(events[0].id);
            expect(scout.registrations[1].event_id).to.equal(events[1].id);
          });
          return done();
        });
    });

    it('should get registrations for an event for a user', function (done) {
      request.get('/api/users/' + generatedUsers.coordinator.profile.id + '/events/' + events[0].id + '/registrations')
        .set('Authorization', generatedUsers.coordinator.token)
        .expect(status.OK)
        .end(function (err, res) {
          if (err) return done(err);
          var registrations = res.body;
          expect(registrations).to.have.lengthOf(5);
          _.forEach(registrations, function (registration, index) {
            expect(registration.event_id).to.equal(events[0].id);
            expect(registration.scout_id).to.equal(generatedScouts[index].id);
            expect(registration.scout.fullname).to.equal(generatedScouts[index].fullname);
            expect(registration.preferences).to.be.a('array');
            expect(registration.assignments).to.be.a('array');
            expect(registration.purchases).to.be.a('array')
          });
          return done();
        });
    });

    it('should get registrations for another event for a user', function (done) {
      request.get('/api/users/' + generatedUsers.coordinator.profile.id + '/events/' + events[1].id + '/registrations')
        .set('Authorization', generatedUsers.coordinator.token)
        .expect(status.OK)
        .end(function (err, res) {
          if (err) return done(err);
          var registrations = res.body;
          expect(registrations).to.have.lengthOf(5);
          _.forEach(registrations, function (registration, index) {
            expect(registration.event_id).to.equal(events[1].id);
            expect(registration.scout_id).to.equal(generatedScouts[index].id);
            expect(registration.scout.fullname).to.equal(generatedScouts[index].fullname);
            expect(registration.preferences).to.be.a('array');
            expect(registration.assignments).to.be.a('array');
            expect(registration.purchases).to.be.a('array')
          });
          return done();
        });
    });

    it('should get registrations for an event for another user', function (done) {
      request.get('/api/users/' + generatedUsers.coordinator2.profile.id + '/events/' + events[0].id + '/registrations')
        .set('Authorization', generatedUsers.coordinator2.token)
        .expect(status.OK)
        .end(function (err, res) {
          if (err) return done(err);
          var registrations = res.body;
          expect(registrations).to.have.lengthOf(5);
          _.forEach(registrations, function (registration, index) {
            expect(registration.event_id).to.equal(events[0].id);
            expect(registration.scout_id).to.equal(generatedScouts2[index].id);
            expect(registration.scout.fullname).to.equal(generatedScouts2[index].fullname);
            expect(registration.preferences).to.be.a('array');
            expect(registration.assignments).to.be.a('array');
            expect(registration.purchases).to.be.a('array')
          });
          return done();
        });
    });

    it('should allow admins to see scout registrations for a user', function (done) {
      request.get('/api/users/' + generatedUsers.coordinator.profile.id + '/scouts/registrations')
        .set('Authorization', generatedUsers.admin.token)
        .expect(status.OK, done);
    });

    it('should allow teachers to see scout registrations for a user', function (done) {
      request.get('/api/users/' + generatedUsers.coordinator.profile.id + '/scouts/registrations')
        .set('Authorization', generatedUsers.teacher.token)
        .expect(status.OK, done);
    });

    it('should not allow other coordinators to see scout registrations for a user', function (done) {
      request.get('/api/users/' + generatedUsers.coordinator.profile.id + '/scouts/registrations')
        .set('Authorization', generatedUsers.coordinator2.token)
        .expect(status.UNAUTHORIZED, done);
    });
  });
});
