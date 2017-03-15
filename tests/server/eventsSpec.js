var app = require('../../src/app');
var request = require('supertest')(app);
var async = require('async');
var status = require('http-status-codes');
var should = require('should');
var _ = require('lodash');

var chai = require('chai');
var expect = chai.expect;

var utils = require('./testUtils');

describe('events', function () {
  var token;
  var adminToken;
  var badId = utils.badId;

  // Create a user with permission to create events before running tests. Only
  // do this once to avoid overhead of creating a user for each test.
  before(function (done) {
    utils.generateToken('coordinator', function (err, genToken) {
      token = genToken;
      done();
    });
  });

  before(function (done) {
    utils.generateToken('admin', function (err, genToken) {
      adminToken = genToken;
      done();
    });
  });

  // Make sure the event collection doesn't exist before each tests. Don't drop the entire
  // db, because then the user would need to be created again
  beforeEach(function (done) {
    utils.dropTable(['Event'], done);
  });

  after(function (done) {
    utils.dropDb(done);
  });

  describe('creating an event', function () {
    var testEvent = {
      year: 2016,
      semester: 'Spring',
      date: new Date(2016, 3, 14),
      registration_open: new Date(2016, 1, 12),
      registration_close: new Date(2016, 3, 1),
      price: 10
    };

    it('should create events with year and semester', function (done) {
      request.post('/api/events')
        .set('Authorization', adminToken)
        .send(testEvent)
        .expect(status.CREATED, done);
    });

    it('should require authorization as admin', function (done) {
      request.post('/api/events')
        .set('Authorization', token)
        .send(testEvent)
        .expect(status.UNAUTHORIZED, done);
    });

    it('should fail gracefully for a blank request', function (done) {
      request.post('/api/events')
        .set('Authorization', adminToken)
        .send({})
        .expect(status.BAD_REQUEST, done);
    });

    it('should ignore extra fields', function (done) {
      var postData = testEvent;
      postData.extra = 'extra data';

      request.post('/api/events')
        .set('Authorization', adminToken)
        .send(postData)
        .expect(status.CREATED)
        .end(function (err, res) {
          if (err) return done(err);
          should.not.exist(res.body.event.extra);
          done();
        });
    });
  });

  describe('when events already exist', function () {
    var id1, id2;

    var testEvent1 = {
      year: 2016,
      semester: 'Spring',
      date: new Date(2016, 3, 14),
      registration_open: new Date(2016, 1, 12),
      registration_close: new Date(2016, 3, 1),
      price: 10
    };

    var testEvent2 = {
      year: 2015,
      semester: 'Fall',
      date: new Date(2015, 11, 11),
      registration_open: new Date(2015, 9, 10),
      registration_close: new Date(2015, 11, 1),
      price: 10
    };

    beforeEach(function (done) {
      async.series([
        function (cb) {
          request.post('/api/events')
            .set('Authorization', adminToken)
            .send(testEvent1)
            .expect(status.CREATED)
            .end(function (err, res) {
              if (err) return done(err);
              id1 = res.body.event.id;
              cb();
            });
        },
        function (cb) {
          request.post('/api/events')
            .set('Authorization', adminToken)
            .send(testEvent2)
            .expect(status.CREATED)
            .end(function (err, res) {
              if (err) return done(err);
              id2 = res.body.event.id;
              cb();
            });
        }
      ], done);
    });

    describe('the current event', function () {
      it('should set the current event', function (done) {
        request.post('/api/events/current')
          .set('Authorization', adminToken)
          .send({ id: id1 })
          .expect(status.OK)
          .end(function (err, res) {
            if (err) return done(err);
            expect(res.body.currentEvent.id).to.equal(id1);
            done();
          });
      });

      it('should not set for an invalid id', function (done) {
        request.post('/api/events/current')
          .set('Authorization', adminToken)
          .send({ id: 10000 })
          .expect(status.BAD_REQUEST, done);
      });

      it('should not allow teachers to set', function (done) {
        request.post('/api/events/current')
          .send({ id: id1 })
          .expect(status.UNAUTHORIZED, done);
      });

      it('should get the current event', function (done) {
        async.series([
          function (cb) {
            request.post('/api/events/current')
              .set('Authorization', adminToken)
              .send({ id: id1 })
              .expect(status.OK)
              .end(function (err, res) {
                if (err) return done(err);
                expect(res.body.currentEvent.id).to.equal(id1);
                return cb();
              });
          },
          function (cb) {
            request.get('/api/events/current')
              .expect(status.OK)
              .end(function (err, res) {
                if (err) return done(err);
                expect(res.body.id).to.equal(id1);
                return cb();
              });
          }
        ], done);
      });

      it('should keep track of the latest value', function (done) {
        async.series([
          function (cb) {
            request.post('/api/events/current')
              .set('Authorization', adminToken)
              .send({ id: id1 })
              .expect(status.OK)
              .end(function (err, res) {
                if (err) return done(err);
                expect(res.body.currentEvent.id).to.equal(id1);
                return cb();
              });
          },
          function (cb) {
            request.get('/api/events/current')
              .expect(status.OK)
              .end(function (err, res) {
                if (err) return done(err);
                expect(res.body.id).to.equal(id1);
                return cb();
              });
          },
          function (cb) {
            request.post('/api/events/current')
              .set('Authorization', adminToken)
              .send({ id: id2 })
              .expect(status.OK)
              .end(function (err, res) {
                if (err) return done(err);
                expect(res.body.currentEvent.id).to.equal(id2);
                return cb();
              });
          },
          function (cb) {
            request.get('/api/events/current')
              .expect(status.OK)
              .end(function (err, res) {
                if (err) return done(err);
                expect(res.body.id).to.equal(id2);
                return cb();
              });
          }
        ], done);
      });
    });

    describe('getting an event', function () {
      it('should be able to get an event by id', function (done) {
        async.series([
          function (cb) {
            request.get('/api/events?id=' + id1)
              .expect(status.OK)
              .end(function (err, res) {
                if (err) return done(err);
                var event = res.body[0];
                event.id.should.equal(id1);
                cb();
              });
          },
          function (cb) {
            request.get('/api/events?id=' + id2)
              .expect(status.OK)
              .end(function (err, res) {
                if (err) return done(err);
                var event = res.body[0];
                event.id.should.equal(id2);
                cb();
              });
          }
        ], done);
      });

      it('should get an event by year and semester', function (done) {
        async.series([
          function (cb) {
            request.get('/api/events?year=' + testEvent1.year + '&semester=' + testEvent1.semester)
              .expect(status.OK)
              .end(function (err, res) {
                if (err) return done(err);
                var event = res.body[0];
                event.year.should.equal(testEvent1.year);
                event.semester.should.equal(testEvent1.semester);
                cb();
              });
          },
          function (cb) {
            request.get('/api/events?year=' + testEvent2.year + '&semester=' + testEvent2.semester)
              .expect(status.OK)
              .end(function (err, res) {
                if (err) return done(err);
                var event = res.body[0];
                event.year.should.equal(testEvent2.year);
                event.semester.should.equal(testEvent2.semester);
                cb();
              });
          }
        ], done);
      });

      it('should find events by year', function (done) {
        request.get('/api/events?year=' + testEvent2.year)
          .expect(status.OK)
          .end(function (err, res) {
            if (err) return done(err);
            var event = res.body[0];
            event.id.should.equal(id2);
            done();
          });
      });

      it('should find events by semester', function (done) {
        request.get('/api/events?semester=' + testEvent1.semester)
          .expect(status.OK)
          .end(function (err, res) {
            if (err) return done(err);
            var event = res.body[0];
            event.id.should.equal(id1);
            done();
          });
      });

      it('should get all events if none is specified', function (done) {
        request.get('/api/events')
          .expect(status.OK)
          .end(function (err, res) {
            if (err) return done(err);
            var events = res.body;
            events.length.should.equal(2);
            done();
          });
      });

      it('should return not found if an event is not found by id', function (done) {
        request.get('/api/events?id=123123')
          .expect(status.NOT_FOUND, done);
      });

      it('should return not found if an event is not found by semester', function (done) {
        request.get('/api/events?semester=Summer')
          .expect(status.NOT_FOUND, done);
      });

      it('should return not found if an event is not found by year', function (done) {
        request.get('/api/events?year=1914')
          .expect(status.NOT_FOUND, done);
      });

      it('should return not found if an event is not found by year and semester', function (done) {
        request.get('/api/events?year=1916&semester=Spring')
          .expect(status.NOT_FOUND, done);
      });
    });

    describe('deleting an event', function () {
      it('should require authorization', function (done) {
        request.del('/api/events/' + id1)
          .expect(status.UNAUTHORIZED, done);
      });

      it('should delete an event by id', function (done) {
        async.series([
          function (cb) {
            request.get('/api/events?id=' + id2)
              .expect(status.OK, cb);
          },
          function (cb) {
            request.del('/api/events/' + id2)
              .set('Authorization', adminToken)
              .expect(status.OK, cb);
          },
          function (cb) {
            request.get('/api/events?id=' + id2)
              .expect(status.NOT_FOUND, cb);
          }
        ], done);
      });

      it('should not delete a nonexistent id', function (done) {
        request.del('/api/events/' + badId)
          .set('Authorization', adminToken)
          .expect(status.BAD_REQUEST, done);
      });

      it('should not delete all events', function (done) {
        request.del('/api/events')
          .set('Authorization', adminToken)
          .expect(status.NOT_FOUND, done);
      });
    });

    describe('updating an event', function () {
      var eventUpdate = {
        year: 2014,
        semester: 'Spring',
        date: new Date(2014, 3, 14),
        registration_open: new Date(2014, 1, 12),
        registration_close: new Date(2014, 3, 1),
        price: 5
      };

      it('should update an event', function (done) {
        request.put('/api/events/' + id1)
          .set('Authorization', adminToken)
          .send(eventUpdate)
          .expect(status.OK)
          .end(function (err, res) {
            if (err) return done(err);
            var event = res.body.event;
            event.id.should.equal(id1);
            event.year.should.equal(eventUpdate.year);
            event.price.should.equal(eventUpdate.price);
            return done();
          });
      });

      it('should require admin privileges', function (done) {
        request.put('/api/events/' + id1)
          .set('Authorization', token)
          .send(eventUpdate)
          .expect(status.UNAUTHORIZED, done);
      });

      it('should allow partial updates', function (done) {
        request.put('/api/events/' + id1)
          .set('Authorization', adminToken)
          .send(_.omit(eventUpdate, 'year'))
          .expect(status.OK)
          .end(function (err, res) {
            if (err) return done(err);
            var event = res.body.event;
            event.id.should.equal(id1);
            event.year.should.equal(2016);
            event.price.should.equal(eventUpdate.price);
            return done();
          });
      });

      it('should delete only if explicitly set to null', function (done) {
        request.put('/api/events/' + id1)
          .set('Authorization', adminToken)
          .send({})
          .expect(status.OK, done);
      });
    });
  });
});
