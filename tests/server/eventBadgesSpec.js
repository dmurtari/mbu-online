var app = require('../../src/app');
var request = require('supertest')(app);
var async = require('async');
var status = require('http-status-codes');

var chai = require('chai');
var expect = chai.expect;

var utils = require('./testUtils');

describe('event badge association', function () {
  var adminToken, badges, events;
  var badId = '123456789012345678901234';

  before(function (done) {
    utils.dropDb(done);
  });

  before(function (done) {
    this.timeout(5000);
    utils.generateToken('admin', function (err, token) {
      if (err) return done(err);
      adminToken = token;
      return done();
    });
  });

  beforeEach(function (done) {
    utils.dropTable(['Event', 'Offering', 'Badge'], done);
  });

  beforeEach(function (done) {
    utils.createBadges(adminToken, function (err, items) {
      if (err) return done(err);
      badges = items;
      return done();
    });
  });

  beforeEach(function (done) {
    utils.createEvents(adminToken, function (err, items) {

      if (err) return done(err);
      events = items;
      return done();
    });
  });

  after(function (done) {
    utils.dropDb(done);
  });

  describe('when offerings do not exist', function () {
    it('should create a badge offering', function (done) {
      var postData = {
        badge_id: badges[1].id,
        offering: {
          duration: 1,
          periods: [1, 2, 3],
          price: '10.00',
          requirements: ['1', '2', '3a', '3b']
        }
      };

      request.post('/api/events/' + events[0].id + '/badges')
        .set('Authorization', adminToken)
        .send(postData)
        .expect(status.CREATED)
        .end(function (err, res) {
          if (err) return done(err);
          var event = res.body.event;
          expect(event.offerings).to.have.lengthOf(1);
          expect(event.offerings[0].details.price).to.equal(postData.offering.price);
          expect(event.offerings[0].details.requirements).to.deep.equal(postData.offering.requirements);
          expect(event.offerings[0].id).to.equal(badges[1].id);
          return done();
        });
    });

    it('should default to a price of 0', function (done) {
      var postData = {
        badge_id: badges[0].id,
        offering: {
          duration: 1,
          periods: [1, 2, 3]
        }
      };

      request.post('/api/events/' + events[0].id + '/badges')
        .set('Authorization', adminToken)
        .send(postData)
        .expect(status.CREATED)
        .end(function (err, res) {
          if (err) return done(err);
          var event = res.body.event;
          expect(event.offerings).to.have.lengthOf(1);
          expect(event.offerings[0].details.price).to.equal('0.00');
          expect(event.offerings[0].id).to.equal(badges[0].id);
          return done();
        });
    });

    it('should default to empty requirements', function (done) {
      var postData = {
        badge_id: badges[1].id,
        offering: {
          duration: 1,
          periods: [1, 2, 3],
          price: '10.00'
        }
      };

      request.post('/api/events/' + events[0].id + '/badges')
        .set('Authorization', adminToken)
        .send(postData)
        .expect(status.CREATED)
        .end(function (err, res) {
          if (err) return done(err);
          var event = res.body.event;
          expect(event.offerings).to.have.lengthOf(1);
          expect(event.offerings[0].details.price).to.equal(postData.offering.price);
          expect(event.offerings[0].details.requirements).to.deep.equal([]);
          expect(event.offerings[0].id).to.equal(badges[1].id);
          return done();
        });
    });

    it('should not save null periods', function (done) {
      var postData = {
        badge_id: badges[1].id,
        offering: {
          duration: 1,
          periods: [1, 2, null],
          price: '10.00'
        }
      };

      request.post('/api/events/' + events[0].id + '/badges')
        .set('Authorization', adminToken)
        .send(postData)
        .expect(status.CREATED)
        .end(function (err, res) {
          if (err) return done(err);
          var event = res.body.event;
          expect(event.offerings).to.have.lengthOf(1);
          expect(event.offerings[0].details.price).to.equal(postData.offering.price);
          expect(event.offerings[0].details.periods).to.deep.equal([1, 2]);
          expect(event.offerings[0].id).to.equal(badges[1].id);
          return done();
        });
    });

    it('should create multiple offerings', function (done) {
      async.series([
        function (cb) {
          var postData = {
            badge_id: badges[0].id,
            offering: {
              duration: 1,
              periods: [1, 2, 3],
              price: 10
            }
          };

          request.post('/api/events/' + events[0].id + '/badges')
            .set('Authorization', adminToken)
            .send(postData)
            .expect(status.CREATED)
            .end(function (err, res) {
              if (err) return done(err);
              var event = res.body.event;
              expect(event.offerings).to.have.lengthOf(1);
              expect(event.offerings[0].details.price).to.equal('10.00');
              expect(event.offerings[0].details.duration).to.equal(1);
              expect(event.offerings[0].details.periods).to.eql([1, 2, 3]);
              expect(event.offerings[0].id).to.equal(badges[0].id);
              return cb();
            });
        },
        function (cb) {
          var postData = {
            badge_id: badges[1].id,
            offering: {
              duration: 2,
              periods: [2, 3]
            }
          };
          request.post('/api/events/' + events[0].id + '/badges')
            .set('Authorization', adminToken)
            .send(postData)
            .expect(status.CREATED)
            .end(function (err, res) {
              if (err) return done(err);
              var event = res.body.event;
              expect(event.offerings).to.have.lengthOf(2);
              expect(event.offerings[1].details.price).to.equal('0.00');
              expect(event.offerings[1].details.duration).to.equal(2);
              expect(event.offerings[1].details.periods).to.eql([2, 3]);
              expect(event.offerings[1].id).to.equal(badges[1].id);
              return cb();
            });
        }
      ], done);
    });

    it('should not create an offering if the badge does not exist', function (done) {
      var postData = {
        badge_id: badId,
        offering: {
          duration: 1,
          periods: [1, 2, 3]
        }
      };

      request.post('/api/events/' + events[0].id + '/badges')
        .set('Authorization', adminToken)
        .send(postData)
        .expect(status.BAD_REQUEST, done);
    });

    it('should not create an offering if the event does not exist', function (done) {
      var postData = {
        badge_id: badges[0].id,
        offering: {
          duration: 1,
          periods: [1, 2, 3]
        }
      };

      request.post('/api/events/' + badId + '/badges')
        .set('Authorization', adminToken)
        .send(postData)
        .expect(status.BAD_REQUEST, done);
    });

    it('should validate the presence of required fields', function (done) {
      var postData = {
        badge_id: badges[0].id
      };

      request.post('/api/events/' + events[0].id + '/badges')
        .set('Authorization', adminToken)
        .send(postData)
        .expect(status.BAD_REQUEST, done);
    });

    it('should validate for correct durations', function (done) {
      var postData = {
        badge_id: badges[0].id,
        offering: {
          duration: 2,
          periods: [1]
        }
      };

      request.post('/api/events/' + events[0].id + '/badges')
        .set('Authorization', adminToken)
        .send(postData)
        .expect(status.BAD_REQUEST, done);
    });

    it('should respond gracefully to bad ids', function (done) {
      var postData = {
        badge_id: badges[0].id,
        offering: {
          duration: 1,
          periods: [1, 2, 3]
        }
      };

      request.post('/api/events/123/badges')
        .set('Authorization', adminToken)
        .send(postData)
        .expect(status.BAD_REQUEST, done);
    });
  });

  describe('when offerings exist', function () {
    var offerings;
    var defaultPostData = {
      price: 10,
      periods: [1, 2, 3],
      duration: 1,
      requirements: ['1', '2a', '3']
    };

    beforeEach(function (done) {
      utils.createOfferingsForEvent(events[0], badges, defaultPostData, adminToken, function (err, items) {
        if (err) return done(err);
        offerings = items;
        return done();
      });
    });

    describe('getting offerings', function () {
      it('should get all offerings for an event', function (done) {
        request.get('/api/events?id=' + events[0].id)
          .expect(status.OK)
          .end(function (err, res) {
            if (err) return done(err);
            var event = res.body[0];
            expect(event.offerings.length).to.equal(3);
            expect(event.offerings[0].id).to.equal(badges[0].id);
            expect(event.offerings[1].id).to.equal(badges[1].id);
            expect(event.offerings[2].id).to.equal(badges[2].id);
            return done();
          });
      });
    });

    describe('updating offerings', function () {
      it('should be able to update without specifying a badge', function (done) {
        var offeringUpdate = {
          duration: 1,
          periods: [1, 2],
          price: '5.00',
          requirements: ['1', '2b']
        };

        request.put('/api/events/' + events[0].id + '/badges/' + offerings[0].id)
          .set('Authorization', adminToken)
          .send(offeringUpdate)
          .end(function (err, res) {
            if (err) return done(err);
            var offering = res.body.offering;
            expect(offering.badge_id).to.equal(badges[0].id);
            expect(offering.duration).to.equal(offeringUpdate.duration);
            expect(offering.periods).to.deep.equal(offeringUpdate.periods);
            expect(offering.price).to.equal(offeringUpdate.price);
            expect(offering.requirements).to.deep.equal(offeringUpdate.requirements);
            return done();
          });
      });

      it('should not require price', function (done) {
        var offeringUpdate = {
          duration: 1,
          periods: [1, 2]
        };

        request.put('/api/events/' + events[0].id + '/badges/' + offerings[0].id)
          .set('Authorization', adminToken)
          .send(offeringUpdate)
          .end(function (err, res) {
            if (err) return done(err);
            var offering = res.body.offering;
            expect(offering.badge_id).to.equal(badges[0].id);
            expect(offering.duration).to.equal(1);
            expect(offering.periods).to.deep.equal([1, 2]);
            expect(offering.price).to.equal('10.00'); // Default value for price if not specified
            return done();
          });
      });

      it('should should not save null periods', function (done) {
        var offeringUpdate = {
          duration: 1,
          periods: [1, 2, null]
        };

        request.put('/api/events/' + events[0].id + '/badges/' + offerings[0].id)
          .set('Authorization', adminToken)
          .send(offeringUpdate)
          .end(function (err, res) {
            if (err) return done(err);
            var offering = res.body.offering;
            expect(offering.badge_id).to.equal(badges[0].id);
            expect(offering.duration).to.equal(1);
            expect(offering.periods).to.deep.equal([1, 2]);
            expect(offering.price).to.equal('10.00'); // Default value for price if not specified
            return done();
          });
      });

      it('should not delete existing offerings if an event is updating without supplying offerings', function (done) {
        var eventUpdate = {
          year: 2014,
          semester: 'Spring',
          date: new Date(2014, 3, 14),
          registration_open: new Date(2014, 1, 12),
          registration_close: new Date(2014, 3, 1),
          price: 5
        };

        request.put('/api/events/' + events[0].id)
          .set('Authorization', adminToken)
          .send(eventUpdate)
          .expect(status.OK)
          .end(function (err, res) {
            if (err) return done(err);
            var event = res.body.event;
            expect(event.id).to.equal(events[0].id);
            expect(event.year).to.equal(eventUpdate.year);
            expect(event.price).to.equal(eventUpdate.price);
            expect(event.offerings).to.have.lengthOf(3);
            return done();
          });
      });

      it('should not allow an update with invalid information', function (done) {
        var offeringUpdate = {
          duration: 2,
          periods: [1]
        };

        request.put('/api/events/' + events[0].id + '/badges/' + offerings[0].id)
          .set('Authorization', adminToken)
          .send(offeringUpdate)
          .expect(status.BAD_REQUEST, done);
      });

      it('should not update with extra fields', function (done) {
        var offeringUpdate = {
          duration: 1,
          periods: [1, 2],
          price: '5.00',
          extra: true
        };

        request.put('/api/events/' + events[0].id + '/badges/' + offerings[0].id)
          .set('Authorization', adminToken)
          .send(offeringUpdate)
          .end(function (err, res) {
            if (err) return done(err);
            var offering = res.body.offering;
            expect(offering.badge_id).to.equal(badges[0].id);
            expect(offering.duration).to.equal(offeringUpdate.duration);
            expect(offering.periods).to.deep.equal(offeringUpdate.periods);
            expect(offering.price).to.equal(offeringUpdate.price);
            expect(offering.extra).to.not.exist;
            return done();
          });
      });

      it('should update without deleting fields', function (done) {
        var offeringUpdate = {
          duration: 1
        };
        request.put('/api/events/' + events[0].id + '/badges/' + offerings[0].id)
          .set('Authorization', adminToken)
          .send(offeringUpdate)
          .expect(status.OK)
          .end(function (err, res) {
            if (err) return done(err);
            var offering = res.body.offering;
            expect(offering.badge_id).to.equal(badges[0].id);
            expect(offering.duration).to.equal(offeringUpdate.duration);
            expect(offering.periods).to.deep.equal(offerings[0].offering.periods);
            expect(offering.price).to.equal(offerings[0].offering.price);
            expect(offering.requirements).to.deep.equal(offerings[0].offering.requirements);
            return done();
          });
      });

      it('should not update a nonexistent event', function (done) {
        var offeringUpdate = {
          duration: 1,
          periods: [1, 2],
          price: 5
        };

        request.put('/api/events/' + badId + '/badges/' + offerings[0].id)
          .set('Authorization', adminToken)
          .send(offeringUpdate)
          .expect(status.BAD_REQUEST, done);
      });

      it('should not update a nonexistent offering', function (done) {
        var offeringUpdate = {
          duration: 1,
          periods: [1, 2],
          price: 5
        };

        request.put('/api/events/' + events[0].id + '/badges/' + badId)
          .set('Authorization', adminToken)
          .send(offeringUpdate)
          .expect(status.BAD_REQUEST, done);
      });
    });

    describe('deleting offerings', function () {
      it('should be able to delete an offering', function (done) {
        async.series([
          function (cb) {
            request.get('/api/events?id=' + events[0].id)
              .expect(status.OK)
              .end(function (err, res) {
                if (err) return cb(err);
                var event = res.body[0];
                expect(event.offerings).to.have.lengthOf(3);
                return cb();
              });
          },
          function (cb) {
            request.del('/api/events/' + events[0].id + '/badges/' + offerings[1].id)
              .set('Authorization', adminToken)
              .expect(status.OK, cb);
          },
          function (cb) {
            request.get('/api/events?id=' + events[0].id)
              .expect(status.OK)
              .end(function (err, res) {
                if (err) return cb(err);
                var event = res.body[0];
                expect(event.offerings).to.have.lengthOf(2);
                return cb();
              });
          }
        ], done);
      });

      it('should require authorization', function (done) {
        request.del('/api/events/' + events[0].id + '/badges/' + offerings[0].id)
          .expect(status.UNAUTHORIZED, done);
      });

      it('should not delete from a nonexistant event', function (done) {
        request.del('/api/events/' + badId + '/badges/' + offerings[0].id)
          .set('Authorization', adminToken)
          .expect(status.BAD_REQUEST, done);
      });

      it('should not delete a nonexistant offering', function (done) {
        request.del('/api/events/' + events[0].id + '/badges/' + badId)
          .set('Authorization', adminToken)
          .expect(status.BAD_REQUEST, done);
      });
    });
  });
});
