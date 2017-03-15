var app = require('../../src/app');
var request = require('supertest')(app);
var async = require('async');
var status = require('http-status-codes');

var chai = require('chai');
var expect = chai.expect;

var utils = require('./testUtils');
var scoutsGroup1 = require('./testScouts')(2);
var scoutsGroup2 = require('./testScouts')(2);

describe('payments', function () {
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

  before(function (done) {
    this.timeout(10000);
    utils.generateTokens(['admin', 'teacher', 'coordinator', 'coordinator2'], function (err, generatedTokens) {
      if (err) return done(err);
      generatedUsers = generatedTokens;
      return done();
    });
  });

  before(function (done) {
    utils.createEvents(generatedUsers.admin.token, function (err, events) {
      if (err) return done(err);
      generatedEvents = events;
      return done();
    });
  });

  before(function (done) {
    utils.createBadges(generatedUsers.admin.token, function (err, badges) {
      if (err) return done(err);
      generatedBadges = badges;
      return done();
    });
  });

  beforeEach(function (done) {
    utils.dropTable(['Scout', 'Registration', 'Offering', 'Purchase'], done);
  });

  beforeEach(function (done) {
    utils.createScoutsForUser(generatedUsers.coordinator, scoutsGroup1, generatedUsers.coordinator.token, function (err, scouts) {
      if (err) return done(err);
      generatedTroop1 = scouts;
      return done();
    });
  });

  beforeEach(function (done) {
    utils.createScoutsForUser(generatedUsers.coordinator2, scoutsGroup2, generatedUsers.coordinator2.token, function (err, scouts) {
      if (err) return done(err);
      generatedTroop2 = scouts;
      return done();
    });
  });

  beforeEach(function (done) {
    async.series([
      // Create offerings for an event
      function (cb) {
        request.post('/api/events/' + generatedEvents[0].id + '/badges')
          .set('Authorization', generatedUsers.admin.token)
          .send({
            badge_id: generatedBadges[0].id,
            offering: {
              duration: 1,
              periods: [1, 2, 3],
              price: badgeCost
            }
          })
          .expect(status.CREATED)
          .end(function (err, res) {
            if (err) return cb(err);
            offeringIds.push(res.body.event.offerings[0].details.id);
            return cb();
          });
      },
      function (cb) {
        request.post('/api/events/' + generatedEvents[0].id + '/badges')
          .set('Authorization', generatedUsers.admin.token)
          .send({
            badge_id: generatedBadges[1].id,
            offering: {
              duration: 2,
              periods: [2, 3]
            }
          })
          .expect(status.CREATED)
          .end(function (err, res) {
            if (err) return cb(err);
            offeringIds.push(res.body.event.offerings[1].details.id);
            return cb();
          });
      },
      function (cb) {
        request.post('/api/events/' + generatedEvents[1].id + '/badges')
          .set('Authorization', generatedUsers.admin.token)
          .send({
            badge_id: generatedBadges[1].id,
            offering: {
              duration: 2,
              periods: [2, 3],
              price: badgeCost
            }
          })
          .expect(status.CREATED)
          .end(function (err, res) {
            if (err) return cb(err);
            offeringIds.push(res.body.event.offerings[0].details.id);
            return cb();
          });
      },
      // Create purchasable items for an event
      function (cb) {
        request.post('/api/events/' + generatedEvents[0].id + '/purchasables')
          .set('Authorization', generatedUsers.admin.token)
          .send({
            item: 'T-Shirt',
            price: tShirtCost
          })
          .expect(status.CREATED)
          .end(function (err, res) {
            if (err) return cb(err);
            purchasableIds.push(res.body.purchasables[0].id);
            return cb();
          });
      },
      function (cb) {
        request.post('/api/events/' + generatedEvents[0].id + '/purchasables')
          .set('Authorization', generatedUsers.admin.token)
          .send({
            item: 'Lunch',
            price: lunchCost
          })
          .expect(status.CREATED)
          .end(function (err, res) {
            if (err) return cb(err);
            purchasableIds.push(res.body.purchasables[1].id);
            return cb();
          });
      },
      // Register scout for an event
      function (cb) {
        request.post('/api/scouts/' + generatedTroop1[0].id + '/registrations')
          .set('Authorization', generatedUsers.coordinator.token)
          .send({
            event_id: generatedEvents[0].id
          })
          .expect(status.CREATED)
          .end(function (err, res) {
            if (err) return cb(err);
            registrationIds.push(res.body.registration.id);
            return cb();
          });
      },
      // Create preferences for a registration
      function (cb) {
        request.post('/api/scouts/' + generatedTroop1[0].id + '/registrations/' + registrationIds[0] + '/preferences')
          .set('Authorization', generatedUsers.coordinator.token)
          .send({
            offering: offeringIds[1],
            rank: 1
          })
          .expect(status.CREATED, cb);
      },
      function (cb) {
        request.post('/api/scouts/' + generatedTroop1[0].id + '/registrations/' + registrationIds[0] + '/preferences')
          .set('Authorization', generatedUsers.coordinator.token)
          .send({
            offering: offeringIds[0],
            rank: 2
          })
          .expect(status.CREATED, cb);
      },
      function (cb) {
        request.post('/api/scouts/' + generatedTroop1[0].id + '/registrations/' + registrationIds[0] + '/purchases')
          .set('Authorization', generatedUsers.coordinator.token)
          .send({
            // T-Shirt
            purchasable: purchasableIds[0],
            quantity: 3
          })
          .expect(status.CREATED, cb);
      },
      function (cb) {
        request.post('/api/scouts/' + generatedTroop1[0].id + '/registrations/' + registrationIds[0] + '/purchases')
          .set('Authorization', generatedUsers.coordinator.token)
          .send({
            // Lunch
            purchasable: purchasableIds[1],
            quantity: 1
          })
          .expect(status.CREATED, cb);
      },
      // Register another scout for an event
      function (cb) {
        request.post('/api/scouts/' + generatedTroop1[1].id + '/registrations')
          .set('Authorization', generatedUsers.coordinator.token)
          .send({
            event_id: generatedEvents[0].id
          })
          .expect(status.CREATED)
          .end(function (err, res) {
            if (err) return cb(err);
            registrationIds.push(res.body.registration.id);
            return cb();
          });
      },
      // Create preferences for a registration
      function (cb) {
        request.post('/api/scouts/' + generatedTroop1[1].id + '/registrations/' + registrationIds[1] + '/preferences')
          .set('Authorization', generatedUsers.coordinator.token)
          .send({
            offering: offeringIds[1],
            rank: 1
          })
          .expect(status.CREATED, cb);
      },
      function (cb) {
        request.post('/api/scouts/' + generatedTroop1[1].id + '/registrations/' + registrationIds[1] + '/preferences')
          .set('Authorization', generatedUsers.coordinator.token)
          .send({
            offering: offeringIds[0],
            rank: 2
          })
          .expect(status.CREATED, cb);
      },
      function (cb) {
        request.post('/api/scouts/' + generatedTroop1[1].id + '/registrations/' + registrationIds[1] + '/purchases')
          .set('Authorization', generatedUsers.coordinator.token)
          .send({
            // T-Shirt
            purchasable: purchasableIds[0],
            quantity: 1
          })
          .expect(status.CREATED, cb);
      },
      function (cb) {
        request.post('/api/scouts/' + generatedTroop1[1].id + '/registrations/' + registrationIds[1] + '/purchases')
          .set('Authorization', generatedUsers.coordinator.token)
          .send({
            // Lunch
            purchasable: purchasableIds[1],
            quantity: 3
          })
          .expect(status.CREATED, cb);
      },
      // Register the same scout for a different event
      function (cb) {
        request.post('/api/scouts/' + generatedTroop1[1].id + '/registrations')
          .set('Authorization', generatedUsers.coordinator.token)
          .send({
            event_id: generatedEvents[1].id
          })
          .expect(status.CREATED)
          .end(function (err, res) {
            if (err) return cb(err);
            registrationIds.push(res.body.registration.id);
            return cb();
          });
      },
      function (cb) {
        request.post('/api/scouts/' + generatedTroop1[1].id + '/registrations/' + registrationIds[2] + '/preferences')
          .set('Authorization', generatedUsers.coordinator.token)
          .send({
            offering: offeringIds[2],
            rank: 1
          })
          .expect(status.CREATED, cb);
      },
      // Register a scout from a different troop
      function (cb) {
        request.post('/api/scouts/' + generatedTroop2[1].id + '/registrations')
          .set('Authorization', generatedUsers.coordinator2.token)
          .send({
            event_id: generatedEvents[0].id
          })
          .expect(status.CREATED)
          .end(function (err, res) {
            if (err) return cb(err);
            registrationIds.push(res.body.registration.id);
            return cb();
          });
      },
      function (cb) {
        request.post('/api/scouts/' + generatedTroop2[1].id + '/registrations/' + registrationIds[3] + '/preferences')
          .set('Authorization', generatedUsers.coordinator2.token)
          .send({
            offering: offeringIds[2],
            rank: 1
          })
          .expect(status.CREATED, cb);
      },
    ], done);
  });

  describe('calculating potential prices', function () {
    it('should calculate for an individual scout', function (done) {
      request.get('/api/scouts/' + generatedTroop1[0].id + '/registrations/' + registrationIds[0] + '/projectedCost')
        .set('Authorization', generatedUsers.coordinator.token)
        .expect(status.OK)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body.cost).to.equal('59.75');
          return done();
        });
    });

    it('should calculate a different cost for another scout', function (done) {
      request.get('/api/scouts/' + generatedTroop1[1].id + '/registrations/' + registrationIds[1] + '/projectedCost')
        .set('Authorization', generatedUsers.coordinator.token)
        .expect(status.OK)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body.cost).to.equal('65.25');
          return done();
        });
    });

    it('should calculate a different cost for another scout for another event', function (done) {
      request.get('/api/scouts/' + generatedTroop1[1].id + '/registrations/' + registrationIds[2] + '/projectedCost')
        .set('Authorization', generatedUsers.coordinator.token)
        .expect(status.OK)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body.cost).to.equal('20.00');
          return done();
        });
    });

    it('should get the potential cost of attendance for a troop', function (done) {
      request.get('/api/users/' + generatedUsers.coordinator.profile.id + '/events/' + generatedEvents[0].id + '/projectedCost')
        .set('Authorization', generatedUsers.coordinator.token)
        .expect(status.OK)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body.cost).to.equal('125.00');
          return done();
        });
    });

    it('should get the potential cost of attendance for a troop for another event', function (done) {
      request.get('/api/users/' + generatedUsers.coordinator.profile.id + '/events/' + generatedEvents[1].id + '/projectedCost')
        .set('Authorization', generatedUsers.coordinator.token)
        .expect(status.OK)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body.cost).to.equal('20.00');
          return done();
        });
    });

    it('should get the potential cost of attendence for a different troop', function (done) {
      request.get('/api/users/' + generatedUsers.coordinator2.profile.id + '/events/' + generatedEvents[0].id + '/projectedCost')
        .set('Authorization', generatedUsers.coordinator2.token)
        .expect(status.OK)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body.cost).to.equal('20.00');
          return done();
        });
    });

    it('should get the total potential income from an event', function (done) {
      request.get('/api/events/' + generatedEvents[0].id + '/potentialIncome')
        .set('Authorization', generatedUsers.admin.token)
        .expect(status.OK)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body.income).to.equal('145.00');
          return done();
        });
    });

    it('should get the total potential income from another event', function (done) {
      request.get('/api/events/' + generatedEvents[1].id + '/potentialIncome')
        .set('Authorization', generatedUsers.admin.token)
        .expect(status.OK)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body.income).to.equal('20.00');
          return done();
        });
    });

    it('should fail for an invalid user', function (done) {
      request.get('/api/users/1337/events/' + generatedEvents[0].id + '/projectedCost')
        .set('Authorization', generatedUsers.admin.token)
        .expect(status.BAD_REQUEST, done);
    });

    it('should fail for an invalid event', function (done) {
      request.get('/api/users/' + generatedUsers.coordinator2.profile.id + '/events/13370/projectedCost')
        .set('Authorization', generatedUsers.admin.token)
        .expect(status.BAD_REQUEST, done);
    });

    it('should fail for an invalid scout', function (done) {
      request.get('/api/scouts/1337/registrations/' + registrationIds[0] + '/projectedCost')
        .set('Authorization', generatedUsers.coordinator.token)
        .expect(status.BAD_REQUEST, done);
    });

    it('should fail for an invalid registration', function (done) {
      request.get('/api/scouts/' + generatedTroop1[1].id  + '/registrations/1337/projectedCost')
        .set('Authorization', generatedUsers.coordinator.token)
        .expect(status.BAD_REQUEST, done);
    });

    it('should fail to get total potential income from an invalid event', function (done) {
      request.get('/api/events/1337/potentialIncome')
        .set('Authorization', generatedUsers.admin.token)
        .expect(status.BAD_REQUEST, done);
    });
  });

  describe('calculating real prices', function () {
    beforeEach(function (done) {
      async.series([
        function (cb) {
          request.post('/api/scouts/' + generatedTroop1[0].id + '/registrations/' + registrationIds[0] + '/assignments')
            .set('Authorization', generatedUsers.teacher.token)
            .send({
              periods: [2, 3],
              offering: offeringIds[1]
            })
            .expect(status.CREATED, cb);
        },
        function (cb) {
          request.post('/api/scouts/' + generatedTroop1[1].id + '/registrations/' + registrationIds[1] + '/assignments')
            .set('Authorization', generatedUsers.teacher.token)
            .send({
              periods: [1],
              offering: offeringIds[0]
            })
            .expect(status.CREATED, cb);
        },
        function (cb) {
          request.post('/api/scouts/' + generatedTroop1[1].id + '/registrations/' + registrationIds[2] + '/assignments')
            .set('Authorization', generatedUsers.teacher.token)
            .send({
              periods: [1],
              offering: offeringIds[0]
            })
            .expect(status.CREATED, cb);
        },
        function (cb) {
          request.post('/api/scouts/' + generatedTroop2[1].id + '/registrations/' + registrationIds[3] + '/assignments')
            .set('Authorization', generatedUsers.teacher.token)
            .send({
              offering: offeringIds[2],
              periods: [1]
            })
            .expect(status.CREATED, cb);
        },
      ], done);
    });

    it('should calculate the actual cost for an individual scout', function (done) {
      request.get('/api/scouts/' + generatedTroop1[0].id + '/registrations/' + registrationIds[0] + '/cost')
        .set('Authorization', generatedUsers.coordinator.token)
        .expect(status.OK)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body.cost).to.equal('49.75');
          return done();
        });
    });

    it('should calculate the actual cost for another scout', function (done) {
      request.get('/api/scouts/' + generatedTroop1[1].id + '/registrations/' + registrationIds[1] + '/cost')
        .set('Authorization', generatedUsers.coordinator.token)
        .expect(status.OK)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body.cost).to.equal('65.25');
          return done();
        });
    });

    it('should calculate the actual cost for another scout and different registration', function (done) {
      request.get('/api/scouts/' + generatedTroop1[1].id + '/registrations/' + registrationIds[2] + '/cost')
        .set('Authorization', generatedUsers.coordinator.token)
        .expect(status.OK)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body.cost).to.equal('20.00');
          return done();
        });
    });

    it('should get the cost of attendance for a troop', function (done) {
      request.get('/api/users/' + generatedUsers.coordinator.profile.id + '/events/' + generatedEvents[0].id + '/cost')
        .set('Authorization', generatedUsers.coordinator.token)
        .expect(status.OK)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body.cost).to.equal('115.00');
          return done();
        });
    });

    it('should get the cost of attendance for a troop for another event', function (done) {
      request.get('/api/users/' + generatedUsers.coordinator.profile.id + '/events/' + generatedEvents[1].id + '/cost')
        .set('Authorization', generatedUsers.coordinator.token)
        .expect(status.OK)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body.cost).to.equal('20.00');
          return done();
        });
    });

    it('should get the cost of attendence for a different troop', function (done) {
      request.get('/api/users/' + generatedUsers.coordinator2.profile.id + '/events/' + generatedEvents[0].id + '/cost')
        .set('Authorization', generatedUsers.coordinator2.token)
        .expect(status.OK)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body.cost).to.equal('20.00');
          return done();
        });
    });

    it('should get the real income from an event', function (done) {
      request.get('/api/events/' + generatedEvents[0].id + '/income')
        .set('Authorization', generatedUsers.admin.token)
        .expect(status.OK)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body.income).to.equal('135.00');
          return done();
        });
    });

    it('should get the real income from another event', function (done) {
      request.get('/api/events/' + generatedEvents[1].id + '/income')
        .set('Authorization', generatedUsers.admin.token)
        .expect(status.OK)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body.income).to.equal('20.00');
          return done();
        });
    });

    it('should fail for an invalid user', function (done) {
      request.get('/api/users/1337/events/' + generatedEvents[0].id + '/cost')
        .set('Authorization', generatedUsers.admin.token)
        .expect(status.BAD_REQUEST, done);
    });

    it('should fail for an invalid event', function (done) {
      request.get('/api/users/' + generatedUsers.coordinator2.profile.id + '/events/13370/cost')
        .set('Authorization', generatedUsers.admin.token)
        .expect(status.BAD_REQUEST, done);
    });

    it('should fail for an invalid scout', function (done) {
      request.get('/api/scouts/1337/registrations/' + registrationIds[0] + '/cost')
        .set('Authorization', generatedUsers.coordinator.token)
        .expect(status.BAD_REQUEST, done);
    });

    it('should fail for an invalid registration', function (done) {
      request.get('/api/scouts/' + generatedTroop1[1].id + '/registrations/1337/cost')
        .set('Authorization', generatedUsers.coordinator.token)
        .expect(status.BAD_REQUEST, done);
    });

    it('should fail to get total income from an invalid event', function (done) {
      request.get('/api/events/1337/income')
        .set('Authorization', generatedUsers.admin.token)
        .expect(status.BAD_REQUEST, done);
    });
  });
});



