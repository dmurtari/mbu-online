var app = require('../../src/app');
var request = require('supertest')(app);
var async = require('async');
var status = require('http-status-codes');

var chai = require('chai');
var expect = chai.expect;

var utils = require('./testUtils');

describe.only('Class sizes', function () {
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
    it('should default to 20 as the size limit', function (done) {
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
          expect(event.offerings[0].details.size_limit).to.equal(20);
          return done();
        });
    });

    it('should accept an input for class size', function (done) {
      var postData = {
        badge_id: badges[1].id,
        offering: {
          duration: 1,
          periods: [1, 2, 3],
          price: '10.00',
          requirements: ['1', '2', '3a', '3b'],
          size_limit: 30
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
          expect(event.offerings[0].details.size_limit).to.equal(30);
          return done();
        });
    });
  });
});
