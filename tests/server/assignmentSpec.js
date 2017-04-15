var app = require('../../src/app');
var request = require('supertest')(app);
var async = require('async');
var status = require('http-status-codes');
var _ = require('lodash');

var chai = require('chai');
var expect = chai.expect;

var utils = require('./testUtils');
var testScouts = require('./testScouts');

describe('assignments', function () {
  var badges, events;
  var generatedUsers, generatedScouts, generatedOfferings;
  var badId = utils.badId;
  var scoutId;
  var registrationIds = [];
  var defaultRequirements = ['1', '2', '3a'];

  before(function (done) {
    utils.dropDb(done);
  });

  before(function (done) {
    this.timeout(10000);
    utils.generateTokens(['admin', 'teacher', 'coordinator'], function (err, generatedTokens) {
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
      duration: 1,
      requirements: defaultRequirements
    };

    utils.createOfferingsForEvent(events[0], badges, defaultPostData, generatedUsers.admin.token, function (err, offerings) {
      if (err) return done(err);
      generatedOfferings = offerings;
      return done();
    });
  });

  beforeEach(function (done) {
    utils.dropTable(['Registration', 'Assignment'], done);
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

  describe('when assignments do not exist', function () {
    it('should be able to assign a scout to an offering', function (done) {
      var postData = {
        periods: [1],
        offering: generatedOfferings[1].id
      };

      request.post('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/assignments')
        .set('Authorization', generatedUsers.teacher.token)
        .send(postData)
        .expect(status.CREATED)
        .end(function (err, res) {
          if (err) return done(err);
          var registration = res.body.registration;
          expect(registration.assignments).to.have.length(1);
          var assignment = registration.assignments[0];
          expect(assignment.offering_id).to.equal(postData.offering);
          expect(assignment.details.periods).to.deep.equal(postData.periods);
          return done();
        });
    });

    it('should create a blank object of completions', function (done) {
      var postData = {
        periods: [1],
        offering: generatedOfferings[1].id
      };

      request.post('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/assignments')
        .set('Authorization', generatedUsers.teacher.token)
        .send(postData)
        .expect(status.CREATED)
        .end(function (err, res) {
          if (err) return done(err);
          var registration = res.body.registration;
          expect(registration.assignments).to.have.length(1);
          var assignment = registration.assignments[0];
          expect(assignment.offering_id).to.equal(postData.offering);
          expect(assignment.details.completions).to.deep.equal([])
          expect(assignment.details.periods).to.deep.equal(postData.periods);
          return done();
        });
    });

    it('should be able to batch assign to offerings', function (done) {
      var postData = [{
        periods: [1],
        offering: generatedOfferings[0].id
      }, {
        periods: [2],
        offering: generatedOfferings[1].id
      }, {
        periods: [3],
        offering: generatedOfferings[2].id
      }];

      request.post('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/assignments')
        .set('Authorization', generatedUsers.admin.token)
        .send(postData)
        .expect(status.CREATED)
        .end(function (err, res) {
          if (err) return done(err);
          var registration = res.body.registration;
          expect(registration.assignments).to.have.lengthOf(3);
          _.forEach(registration.assignments, function (assignment, index) {
            expect(assignment.details.periods).to.deep.equal(postData[index].periods);
            expect(assignment.offering_id).to.equal(postData[index].offering);
            expect(assignment.price).to.exist;
            expect(assignment.badge.name).to.exist;
          });
          return done();
        });
    });

    it('should allow an empty period', function (done) {
      var postData = [{
        periods: [2],
        offering: generatedOfferings[1].id
      }, {
        periods: [3],
        offering: generatedOfferings[2].id
      }];

      request.post('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/assignments')
        .set('Authorization', generatedUsers.admin.token)
        .send(postData)
        .expect(status.CREATED)
        .end(function (err, res) {
          if (err) return done(err);
          var registration = res.body.registration;
          expect(registration.assignments).to.have.lengthOf(2);
          _.forEach(registration.assignments, function (assignment, index) {
            expect(assignment.details.periods).to.deep.equal(postData[index].periods);
            expect(assignment.offering_id).to.equal(postData[index].offering);
            expect(assignment.price).to.exist;
            expect(assignment.badge.name).to.exist;
          });
          return done();
        });
    });

    it('should not allow coordinators to access', function (done) {
      var postData = {
        periods: [1],
        offering: generatedOfferings[1].id
      };

      request.post('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/assignments')
        .set('Authorization', generatedUsers.coordinator.token)
        .send(postData)
        .expect(status.UNAUTHORIZED, done);
    });

    it('should not create for a nonexistant offering', function (done) {
      var postData = {
        offering: utils.badId,
        periods: [1]
      };

      request.post('/api/scouts/' + generatedScouts[0].id + '/registrations/' +
        registrationIds[0] + '/assignments')
        .set('Authorization', generatedUsers.teacher.token)
        .send(postData)
        .expect(status.BAD_REQUEST, done);
    });

    it('should not create for nonexistant registrations', function (done) {
      var postData = {
        offering: generatedOfferings[0].id,
        periods: [1]
      };

      request.post('/api/scouts/' + generatedScouts[0].id + '/registrations/' +
        utils.badId + '/assignments')
        .set('Authorization', generatedUsers.teacher.token)
        .send(postData)
        .expect(status.BAD_REQUEST, done);
    });
  });

  describe('when assignments exist', function () {
    beforeEach(function (done) {
      async.series([
        function (cb) {
          request.post('/api/scouts/' + generatedScouts[0].id + '/registrations/' +
            registrationIds[0] + '/assignments')
            .set('Authorization', generatedUsers.teacher.token)
            .send({
              offering: generatedOfferings[0].id,
              periods: [1]
            })
            .expect(status.CREATED, cb);
        },
        function (cb) {
          request.post('/api/scouts/' + generatedScouts[0].id + '/registrations/' +
            registrationIds[0] + '/assignments')
            .set('Authorization', generatedUsers.teacher.token)
            .send({
              offering: generatedOfferings[1].id,
              periods: [2, 3]
            })
            .expect(status.CREATED, cb);
        },
        function (cb) {
          request.post('/api/scouts/' + generatedScouts[0].id + '/registrations/' +
            registrationIds[1] + '/assignments')
            .set('Authorization', generatedUsers.teacher.token)
            .send({
              offering: generatedOfferings[0].id,
              periods: [3]
            })
            .expect(status.CREATED, cb);
        }
      ], done);
    });

    describe('getting assignments', function () {
      it('should get all assignments for a registration', function (done) {
        request.get('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/assignments')
          .set('Authorization', generatedUsers.teacher.token)
          .expect(status.OK)
          .end(function (err, res) {
            if (err) return done(err);
            var assignments = res.body;
            expect(assignments).to.have.length(2);
            expect(assignments[0].offering_id).to.equal(generatedOfferings[0].id);
            expect(assignments[0].details.periods).to.deep.equal([1]);
            expect(assignments[0].details.completions).to.exist;
            expect(assignments[1].offering_id).to.equal(generatedOfferings[1].id);
            expect(assignments[1].details.periods).to.deep.equal([2, 3]);
            expect(assignments[1].details.completions).to.exist;
            return done();
          });
      });

      it('should not get with an incorrect scout', function (done) {
        request.get('/api/scouts/' + badId + '/registrations/' + registrationIds[0] + '/assignments')
          .set('Authorization', generatedUsers.teacher.token)
          .expect(status.BAD_REQUEST, done);
      });

      it('should not get with an incorrect registration', function (done) {
        request.get('/api/scouts/' + generatedScouts[0].id + '/registrations/' + badId + '/assignments')
          .set('Authorization', generatedUsers.teacher.token)
          .expect(status.BAD_REQUEST, done);
      });
    });

    describe('updating assignments', function () {
      it('should update a assignment periods', function (done) {
        async.series([
          function (cb) {
            request.get('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/assignments')
              .set('Authorization', generatedUsers.teacher.token)
              .expect(status.OK)
              .end(function (err, res) {
                if (err) return done(err);
                expect(res.body[0].offering_id).to.exist;
                expect(res.body[0].details.periods).to.deep.equal([1]);
                return cb();
              });
          },
          function (cb) {
            request.put('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/assignments/' + generatedOfferings[0].id)
              .set('Authorization', generatedUsers.teacher.token)
              .send({
                periods: [2]
              })
              .expect(status.OK)
              .end(function (err, res) {
                if (err) return done(err);
                expect(res.body.assignment.periods).to.deep.equal([2]);
                return cb();
              });
          },
          function (cb) {
            request.get('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/assignments')
              .set('Authorization', generatedUsers.teacher.token)
              .expect(status.OK)
              .end(function (err, res) {
                expect(res.body[0].offering_id).to.exist;
                expect(res.body[0].details.periods).to.deep.equal([2]);
                return cb();
              });
          },
        ], done);
      });

      it('should overwrite assignments with a batch', function (done) {
        var postData = [{
          periods: [1],
          offering: generatedOfferings[0].id
        }, {
          periods: [2],
          offering: generatedOfferings[1].id
        }, {
          periods: [3],
          offering: generatedOfferings[2].id
        }];

        request.post('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/assignments')
          .set('Authorization', generatedUsers.admin.token)
          .send(postData)
          .expect(status.CREATED)
          .end(function (err, res) {
            if (err) return done(err);
            var registration = res.body.registration;
            expect(registration.assignments).to.have.lengthOf(3);
            _.forEach(registration.assignments, function (assignment, index) {
              expect(assignment.details.periods).to.deep.equal(postData[index].periods);
              expect(assignment.offering_id).to.equal(postData[index].offering);
              expect(assignment.price).to.exist;
              expect(assignment.badge.name).to.exist;
            });
            return done();
        });
      });

      it('should allow overwriting with empty values for a period', function (done) {
        var postData = [{
          periods: [2],
          offering: generatedOfferings[1].id
        }, {
          periods: [3],
          offering: generatedOfferings[2].id
        }];

        request.post('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/assignments')
          .set('Authorization', generatedUsers.admin.token)
          .send(postData)
          .expect(status.CREATED)
          .end(function (err, res) {
            if (err) return done(err);
            var registration = res.body.registration;
            expect(registration.assignments).to.have.lengthOf(2);
            _.forEach(registration.assignments, function (assignment, index) {
              expect(assignment.details.periods).to.deep.equal(postData[index].periods);
              expect(assignment.offering_id).to.equal(postData[index].offering);
              expect(assignment.price).to.exist;
              expect(assignment.badge.name).to.exist;
            });
            return done();
        });
      });

      it('should not update an invalid assignment', function (done) {
        request.put('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/assignments/' + badId)
          .set('Authorization', generatedUsers.teacher.token)
          .expect(status.BAD_REQUEST, done);
      });

      it('should not update an invalid registration', function (done) {
        request.put('/api/scouts/' + scoutId + '/registrations/' + badId + '/assignments/' + generatedOfferings[0].id)
          .set('Authorization', generatedUsers.teacher.token)
          .expect(status.BAD_REQUEST, done);
      });

      it('should not update for an invalid scout', function (done) {
        request.put('/api/scouts/' + badId + '/registrations/' + registrationIds[0] + '/assignments/' + generatedOfferings[0].id)
          .set('Authorization', generatedUsers.teacher.token)
          .expect(status.BAD_REQUEST, done);
      });
    });

    describe('deleting assignments', function () {
      it('should delete an existing assignment', function (done) {
        async.series([
          function (cb) {
            request.get('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/assignments')
              .set('Authorization', generatedUsers.teacher.token)
              .expect(status.OK)
              .end(function (err, res) {
                if (err) return done(err);
                expect(res.body).to.have.length(2);
                return cb();
              });
          },
          function (cb) {
            request.del('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/assignments/' + generatedOfferings[0].id)
              .set('Authorization', generatedUsers.teacher.token)
              .expect(status.OK, cb);
          },
          function (cb) {
            request.get('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/assignments')
              .set('Authorization', generatedUsers.teacher.token)
              .expect(status.OK)
              .end(function (err, res) {
                expect(res.body).to.have.length(1);
                return cb();
              });
          },
        ], done);
      });

      it('should not delete an invalid assignment', function (done) {
        request.del('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/assignments/' + badId)
          .set('Authorization', generatedUsers.teacher.token)
          .expect(status.BAD_REQUEST, done);
      });

      it('should not delete an invalid registration', function (done) {
        request.del('/api/scouts/' + scoutId + '/registrations/' + badId + '/assignments/' + generatedOfferings[0].id)
          .set('Authorization', generatedUsers.teacher.token)
          .expect(status.BAD_REQUEST, done);
      });

      it('should not delete for an invalid scout', function (done) {
        request.del('/api/scouts/' + badId + '/registrations/' + registrationIds[0] + '/assignments/' + generatedOfferings[0].id)
          .set('Authorization', generatedUsers.teacher.token)
          .expect(status.BAD_REQUEST, done);
      });
    });
  });
});
