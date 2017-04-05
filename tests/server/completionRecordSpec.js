var app = require('../../src/app');
var request = require('supertest')(app);
var async = require('async');
var status = require('http-status-codes');
var _ = require('lodash');

var chai = require('chai');
var expect = chai.expect;

var utils = require('./testUtils');
var testScouts = require('./testScouts');

describe('completion records', function () {
  var badges, events;
  var generatedUsers, generatedScouts, generatedOfferings;
  var badId = utils.badId;
  var scoutId;
  var registrationIds = [];
  var defaultRequirements = ['1', '2', '3a'];
  var expectedCompletions = _.reduce(defaultRequirements, function (result, requirement) {
    result[requirement] = false;
    return result;
  }, {});
  var newCompletion = _.reduce(defaultRequirements, function (result, requirement) {
    result[requirement] = true;
    return result;
  }, {});

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

  beforeEach(function (done) {
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

  afterEach(function (done) {
    utils.dropTable(['Registration', 'Assignment', 'Offering'], done);
  });

  after(function (done) {
    utils.dropDb(done);
  });

  describe('when assignments are being created', function () {
    it('should create an all false object of completions', function (done) {
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
          expect(assignment.details.completions).to.deep.equal(expectedCompletions);
          expect(assignment.details.periods).to.deep.equal(postData.periods);
          return done();
        });
    });

    it('should create all false object for batch creations', function (done) {
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
            expect(assignment.details.completions).to.deep.equal(expectedCompletions);
            expect(assignment.offering_id).to.equal(postData[index].offering);
            expect(assignment.price).to.exist;
            expect(assignment.badge.name).to.exist;
          });
          return done();
        });
    });
  });

  describe('adding completion records', function () {
    var assignmentId;

    beforeEach(function (done) {
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
            expect(assignment.details.completions).to.deep.equal(expectedCompletions);
            expect(assignment.offering_id).to.equal(postData[index].offering);
            expect(assignment.price).to.exist;
            expect(assignment.badge.name).to.exist;
          });
          return done();
        });
    });

    it('should allow admins to change completion records', function (done) {
      request.put('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/assignments/' + generatedOfferings[0].id)
        .set('Authorization', generatedUsers.admin.token)
        .send({ completions: newCompletion })
        .expect(status.OK)
        .end(function (err, res) {
          if (err) return done(err);
          var assignment = res.body.assignment;
          expect(assignment.offering_id).to.equal(generatedOfferings[0].id);
          expect(assignment.completions).to.deep.equal(newCompletion);
          return done();
        });
    });

    it('should allow teachers to change completion records', function (done) {
      request.put('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/assignments/' + generatedOfferings[0].id)
        .set('Authorization', generatedUsers.admin.token)
        .send({ completions: newCompletion })
        .expect(status.OK, done);
    });

    it('should not allow coordinators to change completion records', function (done) {
      request.put('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/assignments/' + generatedOfferings[0].id)
        .set('Authorization', generatedUsers.coordinator.token)
        .send({ completions: newCompletion })
        .expect(status.UNAUTHORIZED, done);
    });
  });

  describe('changing the offerings requirements', function (done) {
    var newRequirements = ['1', '3b'];

    it('should change an offerings requirements', function (done) {
      request.put('/api/events/' + events[0].id + '/badges/' + generatedOfferings[0].id)
        .set('Authorization', generatedUsers.admin.token)
        .send({ requirements: newRequirements })
        .end(function (err, res) {
          if (err) return done(err);
          var offering = res.body.offering;
          expect(offering.requirements).to.deep.equal(newRequirements);
          return done();
        });
    });

    it('should handle adding to requirements if a completion record exists', function (done) {
      async.series([
        function (cb) {
          var postData = {
            periods: [1],
            offering: generatedOfferings[0].id
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
              expect(assignment.details.completions).to.deep.equal(expectedCompletions)
              expect(assignment.details.periods).to.deep.equal(postData.periods);
              return cb();
            });
        },
        function (cb) {
          request.put('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/assignments/' + generatedOfferings[0].id)
            .set('Authorization', generatedUsers.admin.token)
            .send({ completions: newCompletion })
            .expect(status.OK)
            .end(function (err, res) {
              if (err) return done(err);
              var assignment = res.body.assignment;
              expect(assignment.offering_id).to.equal(generatedOfferings[0].id);
              expect(assignment.completions).to.deep.equal(newCompletion);
              return cb();
            });
        },
        function (cb) {
          request.put('/api/events/' + events[0].id + '/badges/' + generatedOfferings[0].id)
            .set('Authorization', generatedUsers.admin.token)
            .send({ requirements: newRequirements })
            .expect(status.OK)
            .end(function (err, res) {
              if (err) return done(err);
              var offering = res.body.offering;
              expect(offering.requirements).to.deep.equal(newRequirements);
              return cb();
            });
        },
        function (cb) {
          var newExpectedCompletions = newCompletion;
          newExpectedCompletions['3b'] = false;

          request.get('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/assignments')
            .set('Authorization', generatedUsers.teacher.token)
            .expect(status.OK)
            .end(function (err, res) {
              if (err) return done(err);
              var assignments = res.body;
              expect(assignments).to.have.length(1);
              expect(assignments[0].offering_id).to.equal(generatedOfferings[0].id);
              expect(assignments[0].details.completions).to.deep.equal(newExpectedCompletions);
              return cb();
            });
        }
      ], done);
    });

    it('should not remove completed requirements if requirements change', function (done) {
      async.series([
        function (cb) {
          var postData = {
            periods: [1],
            offering: generatedOfferings[0].id
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
              expect(assignment.details.completions).to.deep.equal(expectedCompletions)
              expect(assignment.details.periods).to.deep.equal(postData.periods);
              return cb();
            });
        },
        function (cb) {
          var postData = {
            '1': true,
            '3a': false
          };

          request.put('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/assignments/' + generatedOfferings[0].id)
            .set('Authorization', generatedUsers.admin.token)
            .send({ completions: postData })
            .expect(status.OK)
            .end(function (err, res) {
              if (err) return done(err);
              var assignment = res.body.assignment;
              expect(assignment.offering_id).to.equal(generatedOfferings[0].id);
              expect(assignment.completions).to.deep.equal(postData);
              return cb();
            });
        },
        function (cb) {
          request.put('/api/events/' + events[0].id + '/badges/' + generatedOfferings[0].id)
            .set('Authorization', generatedUsers.admin.token)
            .send({ requirements: newRequirements })
            .expect(status.OK)
            .end(function (err, res) {
              if (err) return done(err);
              var offering = res.body.offering;
              expect(offering.requirements).to.deep.equal(newRequirements);
              return cb();
            });
        },
        function (cb) {
          var newExpectedCompletions = {
            '1': true,
            '3b': false
          };

          request.get('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/assignments')
            .set('Authorization', generatedUsers.teacher.token)
            .expect(status.OK)
            .end(function (err, res) {
              if (err) return done(err);
              var assignments = res.body;
              expect(assignments).to.have.length(1);
              expect(assignments[0].offering_id).to.equal(generatedOfferings[0].id);
              expect(assignments[0].details.completions).to.deep.equal(newExpectedCompletions);
              return cb();
            });
        }
      ], done);
    });
  });

  describe('getting completion records', function () {

  });
});