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
            expect(assignment.details.completions).to.deep.equal([]);
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
        .send({ completions: ['1', '2'] })
        .expect(status.OK)
        .end(function (err, res) {
          if (err) return done(err);
          var assignment = res.body.assignment;
          expect(assignment.offering_id).to.equal(generatedOfferings[0].id);
          expect(assignment.completions).to.deep.equal(['1', '2']);
          return done();
        });
    });

    it('should allow teachers to change completion records', function (done) {
      request.put('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/assignments/' + generatedOfferings[0].id)
        .set('Authorization', generatedUsers.admin.token)
        .send({ completions: ['1'] })
        .expect(status.OK, done);
    });

    it('should not allow coordinators to change completion records', function (done) {
      request.put('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/assignments/' + generatedOfferings[0].id)
        .set('Authorization', generatedUsers.coordinator.token)
        .send({ completions: ['1'] })
        .expect(status.UNAUTHORIZED, done);
    });
  });
});