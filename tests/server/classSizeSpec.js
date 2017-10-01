var app = require('../../src/app');
var request = require('supertest')(app);
var async = require('async');
var status = require('http-status-codes');

var chai = require('chai');
var expect = chai.expect;

var utils = require('./testUtils');
var testScouts = require('./testScouts');

describe.only('Class sizes', function () {
  var badges, events;
  var generatedUsers, generatedScouts, generatedOfferings;
  var scoutId;
  var registrationIds = [];
  var badId = '123456789012345678901234';

  before(function (done) {
    utils.dropDb(done);
  });

  beforeEach(function (done) {
    utils.dropTable(['Event', 'Offering', 'Badge', 'Assignment', 'Registration'], done);
  });

  before(function (done) {
    this.timeout(10000);
    utils.generateTokens(['admin', 'teacher', 'coordinator'], function (err, generatedTokens) {
      if (err) return done(err);
      generatedUsers = generatedTokens;
      return done();
    });
  });

  beforeEach(function (done) {
    utils.createBadges(generatedUsers.admin.token, function (err, items) {
      if (err) return done(err);
      badges = items;
      return done();
    });
  });

  beforeEach(function (done) {
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

  beforeEach(function (done) {
    async.forEachOfSeries(generatedScouts, function (scout, index, cb) {
        request.post('/api/scouts/' + scout.id + '/registrations')
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
    }, function (err) {
      done(err);
    });
  });

  after(function (done) {
    utils.dropDb(done);
  });

  describe('when offerings do not exist', function () {
    var postData;

    beforeEach(function () {
      postData = {
        badge_id: badges[1].id,
        offering: {
          duration: 1,
          periods: [1, 2, 3],
          price: '10.00',
          requirements: ['1', '2', '3a', '3b']
        }
      };
    });

    it('should default to 20 as the size limit', function (done) {
      request.post('/api/events/' + events[0].id + '/badges')
        .set('Authorization', generatedUsers.admin.token)
        .send(postData)
        .expect(status.CREATED)
        .end(function (err, res) {
          if (err) return done(err);
          var event = res.body.event;
          expect(event.offerings).to.have.lengthOf(1);
          expect(event.offerings[0].details.size_limit).to.equal(20);
          return done();
        });
    });

    it('should accept an input for class size', function (done) {
      postData.offering.size_limit = 30;

      request.post('/api/events/' + events[0].id + '/badges')
        .set('Authorization', generatedUsers.admin.token)
        .send(postData)
        .expect(status.CREATED)
        .end(function (err, res) {
          if (err) return done(err);
          var event = res.body.event;
          expect(event.offerings).to.have.lengthOf(1);
          expect(event.offerings[0].details.size_limit).to.equal(30);
          return done();
        });
    });

    it('should not allow a negative class size', function (done) {
      postData.offering.size_limit = -1;

      request.post('/api/events/' + events[0].id + '/badges')
        .set('Authorization', generatedUsers.admin.token)
        .send(postData)
        .expect(status.BAD_REQUEST, done);
    });

    it('should expect a number', function (done) {
      postData.offering.size_limit = 'hello';

      request.post('/api/events/' + events[0].id + '/badges')
        .set('Authorization', generatedUsers.admin.token)
        .send(postData)
        .expect(status.BAD_REQUEST, done);
    });
  });

  describe('when an offering exists', function () {
    var offering, assignmentData;

    beforeEach(function (done) {
      var postData = {
        badge_id: badges[1].id,
        offering: {
          duration: 1,
          periods: [1, 2, 3],
          price: '10.00',
          requirements: ['1', '2', '3a', '3b'],
          size_limit: 1
        }
      };

      request.post('/api/events/' + events[0].id + '/badges')
        .set('Authorization', generatedUsers.admin.token)
        .send(postData)
        .expect(status.CREATED)
        .end(function (err, res) {
          if (err) return done(err);
          var event = res.body.event;
          offering = event.offerings[0];
          return done();
        });
    });

    beforeEach(function () {
      assignmentData = {
        periods: [1],
        offering: offering.details.id
      };
    });

    it('should allow joining if under the limit for a period', function (done) {
      request.post('/api/scouts/' + generatedScouts[0].id + '/registrations/' + registrationIds[0] + '/assignments')
        .set('Authorization', generatedUsers.teacher.token)
        .send(assignmentData)
        .expect(status.CREATED, done);
    });

    it('should allow joining multiple periods under the limit', function (done) {
      async.series([
        function (cb) {
          request.post('/api/scouts/' + generatedScouts[0].id + '/registrations/' + registrationIds[0] + '/assignments')
            .set('Authorization', generatedUsers.teacher.token)
            .send(assignmentData)
            .expect(status.CREATED, cb);
        },
        function (cb) {
          assignmentData.periods = [2];

          request.post('/api/scouts/' + generatedScouts[1].id + '/registrations/' + registrationIds[1] + '/assignments')
            .set('Authorization', generatedUsers.teacher.token)
            .send(assignmentData)
            .expect(status.CREATED, cb);
        }
      ], done);
    });
  });
});
