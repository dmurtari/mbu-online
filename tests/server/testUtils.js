var app = require('../../src/app');
var request = require('supertest')(app);
var async = require('async');
var status = require('http-status-codes');
var _ = require('lodash');

var testEvents = require('./testEvents').events;
var testBadges = require('./testBadges').badges;
var testPurchasables = require('./testPurchasables').purchasables;

var Models = require('../../src/models');

module.exports = {
  badId: '6575',
  dropDb: function (done) {
    Models.sequelize.sync({ force: true })
      .then(function () {
        return done();
      })
      .catch(function (err) {
        done(err);
      });
  },
  dropTable: function (tables, done) {
    async.forEachOfSeries(tables, function (table, index, cb) {
      Models[table].sync({ force: true })
        .then(function () {
          cb();
        })
        .catch(function (err) {
          cb(err);
        });
    }, function (err) {
      done(err);
    });
  },
  generateTokens: function (roles, done) {
    _.defaults(roles, ['admin', 'teacher', 'coordinator']);
    var object = this;
    var tokens = {};
    async.forEachOfSeries(roles, function (role, index, cb) {
      object.generateToken(role, function (err, token, profile) {
        if (err) return done(err);
        tokens[role] = {
          'token': token,
          'profile': profile
        };
        return cb();
      });
    }, function (err) {
      done(err, tokens);
    });
  },
  generateToken: function (name, done) {
    var token, profile;

    // Allow creation of multiple user of same role with form admin1, admin2
    var roleSearchRegexp = /(\D+)/;
    var role = roleSearchRegexp.exec(name)[1];
    var postData = {
      email: name + '@test.com',
      password: 'password',
      firstname: 'firstname',
      lastname: 'lastname',
      role: role
    };

    async.series([
      function (cb) {
        request.post('/api/signup')
          .send(postData)
          .expect(status.CREATED)
          .end(function (err, res) {
            if (err) return done(err);
            profile = res.body.profile;
            token = res.body.token;
            return cb();
          });
      },
      function (cb) {
        Models.User.findById(profile.id)
          .then(function (user) {
            user.approved = true;
            user.save();
          })
          .then(function () {
            return cb();
          });
      }
    ], function () {
      return done(null, token, profile);
    });

  },
  createBadges: function (token, done) {
    var badges = [];
    async.forEachOfSeries(testBadges, function (item, index, cb) {
      request.post('/api/badges')
        .set('Authorization', token)
        .send(item)
        .expect(status.CREATED)
        .end(function (err, res) {
          if (err) return done(err);
          badges.push({
            id: res.body.badge.id,
            badge: item
          });
          return cb();
        });
    }, function (err) {
      done(err, badges);
    });
  },
  createEvents: function (token, done) {
    var events = [];
    async.forEachOfSeries(testEvents, function (item, index, cb) {
      request.post('/api/events')
        .set('Authorization', token)
        .send(item)
        .expect(status.CREATED)
        .end(function (err, res) {
          if (err) return done(err);
          events.push({
            id: res.body.event.id,
            event: item
          });
          return cb();
        });
    }, function (err) {
      done(err, events);
    });
  },
  createOfferingsForEvent: function (event, badges, offering, token, done) {
    var offerings = [];
    console.log("creating for", badges)
    async.forEachOfSeries(badges, function (item, index, cb) {
      var postData = {};
      postData.badge_id = item.id;
      postData.offering = offering;
      console.log(postData)
      request.post('/api/events/' + event.id + '/badges')
        .set('Authorization', token)
        .send(postData)
        .expect(status.CREATED)
        .end(function (err, res) {
          if (err) return done(err);
          console.log(res.body)
          offerings.push({
            id: res.body.event.offerings[index].details.id,
            offering: res.body.event.offerings[index].details
          });
          return cb();
        });
    }, function (err) {
      console.log("created", offerings)
      done(err, offerings);
    });
  },
  createPurchasablesForEvent: function (eventId, done) {
    var purchasables = [];
    async.forEachOfSeries(testPurchasables, function (item, index, cb) {
      var purchasable;
      Models.Purchasable.create(item)
        .then(function (createdPurchasable) {
          purchasable = createdPurchasable;
          return Models.Event.findById(eventId);
        })
        .then(function (event) {
          return event.addPurchasable(purchasable);
        })
        .then(function () {
          return cb();
        })
        .catch(function (err) {
          return done(err);
        });
    }, function (err) {
      if (err) return done(err);
      return Models.Event.findById(eventId, {
        include: [{
          model: Models.Purchasable,
          as: 'purchasables'
        }]
      })
        .then(function (event) {
          _.forEach(event.purchasables, function (purchasable) {
            purchasables.push(purchasable.toJSON());
          });
          return done(null, purchasables);
        });
    });
  },
  createScoutsForUser: function (user, scouts, token, done) {
    var createdScouts = [];
    Models.User.findById(user.profile.id)
      .then(function (userFromDb) {
        async.forEachOfSeries(scouts, function (scout, index, cb) {
          Models.Scout.create(scout)
            .then(function (scout) {
              return userFromDb.addScouts(scout.id);
            })
            .then(function () {
              return cb();
            })
            .catch(function (err) {
              throw new Error('Unable to create scout', err);
            });
        }, function (err) {
          if (err) return done(err);
          return Models.User.findById(user.profile.id, {
            include: [{
              model: Models.Scout,
              as: 'scouts'
            }]
          })
            .then(function (userFromDb) {
              _.forEach(userFromDb.scouts, function (scout) {
                createdScouts.push(scout.toJSON());
              });
              return done(null, createdScouts);
            });
        });
      });
  },
  registerScoutsForEvent: function (eventId, scoutIds, token, done) {
    var registrationIds = [];
    async.forEachOfSeries(scoutIds, function (scoutId, index, cb) {
      request.post('/api/scouts/' + scoutId + '/registrations')
          .set('Authorization', token)
          .send({
            event_id: eventId
          })
          .expect(status.CREATED)
          .end(function (err, res) {
            if (err) return cb(err);
            registrationIds.push(res.body.registration.id);
            return cb();
          });
    }, function (err) {
      done(err, registrationIds);
    });
  },
  removeScoutsForUser: function (user, done) {
    Models.User.findById(user.profile.id)
      .then(function (user) {
        return user.setScouts([]);
      })
      .then(function () {
        done();
      })
      .catch(function (err) {
        done(err);
      });
  }
};
