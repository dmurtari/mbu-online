var app = require('../../src/app');
var request = require('supertest')(app);
var async = require('async');
var status = require('http-status-codes');

var chai = require('chai');
var expect = chai.expect;

var utils = require('./testUtils');
var testScouts = require('./testScouts');

describe('Class sizes', function () {
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

  describe('when an offering exists with a size limit of 1', function () {
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

    it('should get the allowed class size', function (done) {
      request.get('/api/events?id=' + events[0].id)
        .expect(status.OK)
        .end(function (err, res) {
          if (err) return done(err);
          var event = res.body[0];
          expect(event.offerings.length).to.equal(1);
          var offering = event.offerings[0];
          expect(offering.details.size_limit).to.equal(1);
          return done();
        });
    });

    it('should know that there are no enrolled scouts', function (done) {
      request.get('/api/events/' + events[0].id + '/badges/' + offering.id + '/limits')
        .set('Authorization', generatedUsers.teacher.token)
        .expect(status.OK)
        .end(function (err, res) {
          if (err) return done(err);
          var sizeInfo = res.body;
          expect(sizeInfo).to.deep.equal({
            size_limit: 1,
            total: 0,
            1: 0,
            2: 0,
            3: 0
          });
          return done();
        });
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

    describe('and one scout has been assigned', function () {
      var offeringId;

      beforeEach(function (done) {
        request.post('/api/scouts/' + generatedScouts[0].id + '/registrations/' + registrationIds[0] + '/assignments')
          .set('Authorization', generatedUsers.teacher.token)
          .send(assignmentData)
          .expect(status.CREATED)
          .end(function (err, res) {
            offeringId = res.body.registration.assignments[0].offering_id;
            return done();
          });
      });

      it('should know that there is one scout registered', function (done) {
        request.get('/api/events/' + events[0].id + '/badges/' + offering.id + '/limits')
          .set('Authorization', generatedUsers.teacher.token)
          .expect(status.OK)
          .end(function (err, res) {
            if (err) return done(err);
            var sizeInfo = res.body;
            expect(sizeInfo).to.deep.equal({
              size_limit: 1,
              total: 1,
              1: 1,
              2: 0,
              3: 0
            });
            return done();
          });
      });

      it('should not allow the scout to join a different period', function (done) {
        request.put('/api/scouts/' + generatedScouts[0].id + '/registrations/' + registrationIds[0] + '/assignments/' + assignmentData.offering)
          .set('Authorization', generatedUsers.teacher.token)
          .send({
            periods: [3]
          })
          .expect(status.OK, done);
      });

      it('should allow a scout to join a different period', function (done) {
        assignmentData.periods = [2];

        request.post('/api/scouts/' + generatedScouts[1].id + '/registrations/' + registrationIds[1] + '/assignments')
          .set('Authorization', generatedUsers.teacher.token)
          .send(assignmentData)
          .expect(status.CREATED, done);
      });

      it('should not allow another scout to join the same period', function (done) {
        request.post('/api/scouts/' + generatedScouts[1].id + '/registrations/' + registrationIds[1] + '/assignments')
          .set('Authorization', generatedUsers.teacher.token)
          .send(assignmentData)
          .expect(status.BAD_REQUEST, done);
      });

      it('should allow setting completions for that scout', function (done) {
        request.put('/api/scouts/' + generatedScouts[0].id + '/registrations/' + registrationIds[0] + '/assignments/' + offeringId)
          .set('Authorization', generatedUsers.admin.token)
          .send({
            completions: ['1']
          })
          .expect(status.OK, done);
      });

      describe('and a scout has joined a different period', function () {
        beforeEach(function (done) {
          assignmentData.periods = [2];

          request.post('/api/scouts/' + generatedScouts[1].id + '/registrations/' + registrationIds[1] + '/assignments')
            .set('Authorization', generatedUsers.teacher.token)
            .send(assignmentData)
            .expect(status.CREATED, done);
        });

        it('should not allow editing the scout to be in a full class', function (done) {
          request.put('/api/scouts/' + generatedScouts[1].id + '/registrations/' + registrationIds[1] + '/assignments/' + assignmentData.offering)
            .set('Authorization', generatedUsers.teacher.token)
            .send({
              periods: [1]
            })
            .expect(status.BAD_REQUEST, done);
        });
      });
    });
  });

  describe('when a 2 period offering exists', function (done) {
    var offering, assignmentData;

    beforeEach(function (done) {
      var postData = {
        badge_id: badges[1].id,
        offering: {
          duration: 2,
          periods: [2, 3],
          price: '10.00',
          requirements: ['1', '2', '3a', '3b'],
          size_limit: 3
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

    it('should know that there are no scouts assigned', function (done) {
      request.get('/api/events/' + events[0].id + '/badges/' + offering.id + '/limits')
        .set('Authorization', generatedUsers.teacher.token)
        .expect(status.OK)
        .end(function (err, res) {
          if (err) return done(err);
          var sizeInfo = res.body;
          expect(sizeInfo).to.deep.equal({
            size_limit: 3,
            total: 0,
            1: 0,
            2: 0,
            3: 0
          });
          return done();
        });
    });

    describe('when a scout is assigned', function (done) {
      beforeEach(function (done) {
        request.post('/api/scouts/' + generatedScouts[0].id + '/registrations/' + registrationIds[0] + '/assignments')
          .set('Authorization', generatedUsers.teacher.token)
          .send(assignmentData)
          .expect(status.CREATED, done);
      });

      it('should know there is only one scout registered', function (done) {
        request.get('/api/events/' + events[0].id + '/badges/' + offering.id + '/limits')
          .set('Authorization', generatedUsers.teacher.token)
          .expect(status.OK)
          .end(function (err, res) {
            if (err) return done(err);
            var sizeInfo = res.body;
            expect(sizeInfo).to.deep.equal({
              size_limit: 3,
              total: 1,
              1: 1,
              2: 0,
              3: 0
            });
            return done();
          });
      });
    });
  });

  describe('when an offering exists with a limit of 3', function (done) {
    var offering, assignmentData;

    beforeEach(function (done) {
      var postData = {
        badge_id: badges[1].id,
        offering: {
          duration: 1,
          periods: [1, 2, 3],
          price: '10.00',
          requirements: ['1', '2', '3a', '3b'],
          size_limit: 3
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

    it('should know that there are no scouts assigned', function (done) {
      request.get('/api/events/' + events[0].id + '/badges/' + offering.id + '/limits')
        .set('Authorization', generatedUsers.teacher.token)
        .expect(status.OK)
        .end(function (err, res) {
          if (err) return done(err);
          var sizeInfo = res.body;
          expect(sizeInfo).to.deep.equal({
            size_limit: 3,
            total: 0,
            1: 0,
            2: 0,
            3: 0
          });
          return done();
        });
    });

    describe('and scouts have been assigned', function (done) {
      beforeEach(function (done) {
        async.series([
          function (cb) {
            request.post('/api/scouts/' + generatedScouts[0].id + '/registrations/' + registrationIds[0] + '/assignments')
              .set('Authorization', generatedUsers.teacher.token)
              .send(assignmentData)
              .expect(status.CREATED, cb);
          },
          function (cb) {
            request.post('/api/scouts/' + generatedScouts[1].id + '/registrations/' + registrationIds[1] + '/assignments')
              .set('Authorization', generatedUsers.teacher.token)
              .send(assignmentData)
              .expect(status.CREATED, cb);
          },
          function (cb) {
            request.post('/api/scouts/' + generatedScouts[2].id + '/registrations/' + registrationIds[2] + '/assignments')
              .set('Authorization', generatedUsers.teacher.token)
              .send(assignmentData)
              .expect(status.CREATED, cb);
          },
          function (cb) {
            assignmentData.periods = [2];
            cb();
          },
          function (cb) {
            request.post('/api/scouts/' + generatedScouts[3].id + '/registrations/' + registrationIds[3] + '/assignments')
              .set('Authorization', generatedUsers.teacher.token)
              .send(assignmentData)
              .expect(status.CREATED, cb);
          }
        ], done);
      });

      it('should return the correct class sizes', function (done) {
        request.get('/api/events/' + events[0].id + '/badges/' + offering.id + '/limits')
          .set('Authorization', generatedUsers.teacher.token)
          .expect(status.OK)
          .end(function (err, res) {
            if (err) return done(err);
            var sizeInfo = res.body;
            expect(sizeInfo).to.deep.equal({
              size_limit: 3,
              total: 4,
              1: 3,
              2: 1,
              3: 0
            });
            return done();
          });
      });

      it('should not allow joining a full class period', function (done) {
        assignmentData.periods = [1];

        request.post('/api/scouts/' + generatedScouts[5].id + '/registrations/' + registrationIds[5] + '/assignments')
          .set('Authorization', generatedUsers.teacher.token)
          .send(assignmentData)
          .expect(status.BAD_REQUEST, done);
      });

      it('should allow joining a class period with room', function (done) {
        assignmentData.periods = [2];

        request.post('/api/scouts/' + generatedScouts[5].id + '/registrations/' + registrationIds[5] + '/assignments')
          .set('Authorization', generatedUsers.teacher.token)
          .send(assignmentData)
          .expect(status.BAD_REQUEST, done);
      });
    });
  });
});
