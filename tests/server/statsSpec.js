var app = require('../../src/app');
var request = require('supertest')(app);
var async = require('async');
var _ = require('lodash');
var status = require('http-status-codes');

var chai = require('chai');
var expect = chai.expect;

var utils = require('./testUtils');
var mockEvent = require('./mockEvent');
var scoutsGroup1 = require('./testScouts')(2);
var scoutsGroup2 = require('./testScouts')(2);

describe.only('statistics', function () {
  var generatedUsers, generatedTroop1, generatedTroop2, generatedEvents, generatedBadges;
  var badgeCost = '10.00';
  var tShirtCost = '9.25';
  var lunchCost = '12.00';
  var offeringIds = [];
  var purchasableIds = [];
  var registrationIds = [];

  before(function (done) {
    utils.dropDb(done);
  });

  beforeEach(function (done) {
    mockEvent.createPopulatedEvent();
  });

  afterEach(function (done) {
    mockEvent.cleanEvent();
  });

  after(function (done) {
    utils.dropDb(done);
  });

  describe('getting stats for a troop', function () {
    it('should get event statistics for a troop', function (done) {
      request.get('/api/events/' + generatedEvents[0].id + '/stats?troop=' + generatedUsers.coordinator.profile.troop)
        .set('Authorization', generatedUsers.coordinator.token)
        .expect(status.OK)
        .end(function (err, res) {
          if (err) return done(err);
          var stats = res.body;
          console.log(stats.purchases)
        });
    });
  });
});

