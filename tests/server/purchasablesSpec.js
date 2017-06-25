var app = require('../../src/app');
var request = require('supertest')(app);
var async = require('async');
var status = require('http-status-codes');

var chai = require('chai');
var expect = chai.expect;

var utils = require('./testUtils');
var testScouts = require('./testScouts');

describe('purchasables', function () {
  var events;
  var generatedUsers, generatedScouts;
  var badId = utils.badId;
  var scoutId;

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
    utils.createEvents(generatedUsers.admin.token, function (err, items) {
      if (err) return done(err);
      events = items;
      return done();
    });
  });

  beforeEach(function (done) {
    utils.dropTable(['Purchasable'], done);
  });

  after(function (done) {
    utils.dropDb(done);
  });

  describe('creating a purchasable', function () {
    it('should be able to be created for an event', function (done) {
      var postData = {
        item: 'T-Shirt',
        description: 'A t-shirt',
        price: '10.00'
      };

      request.post('/api/events/' + events[0].id + '/purchasables')
        .set('Authorization', generatedUsers.admin.token)
        .send(postData)
        .expect(status.CREATED)
        .end(function (err, res) {
          if (err) return done(err);
          var purchasable = res.body.purchasables[0];
          expect(purchasable.item).to.equal(postData.item);
          expect(purchasable.description).to.equal(postData.description);
          expect(purchasable.price).to.equal(postData.price);
          return done();
        });
    });

    it('should not require a description', function (done) {
      var postData = {
        item: 'T-Shirt',
        price: '10.00'
      };

      request.post('/api/events/' + events[0].id + '/purchasables')
        .set('Authorization', generatedUsers.admin.token)
        .send(postData)
        .expect(status.CREATED)
        .end(function (err, res) {
          if (err) return done(err);
          var purchasable = res.body.purchasables[0];
          expect(purchasable.item).to.equal(postData.item);
          expect(purchasable.price).to.equal(postData.price);
          return done();
        });
    });

    it('should be created with a maximum age', function (done) {
      var postData = {
        item: 'Youth Lunch',
        price: '10.00',
        maximum_age: 10
      };

      request.post('/api/events/' + events[0].id + '/purchasables')
        .set('Authorization', generatedUsers.admin.token)
        .send(postData)
        .expect(status.CREATED)
        .end(function (err, res) {
          if (err) return done(err);
          var purchasable = res.body.purchasables[0];
          expect(purchasable.item).to.equal(postData.item);
          expect(purchasable.price).to.equal(postData.price);
          expect(purchasable.maximum_age).to.equal(postData.maximum_age);
          return done();
        });
    });

    it('should not allow a blank maximum age', function (done) {
      var postData = {
        item: 'Youth Lunch',
        price: '10.00',
        maximum_age: ''
      };

      request.post('/api/events/' + events[0].id + '/purchasables')
        .set('Authorization', generatedUsers.admin.token)
        .send(postData)
        .expect(status.BAD_REQUEST, done);
    });

    it('should not allow a blank minimum age', function (done) {
      var postData = {
        item: 'Youth Lunch',
        price: '10.00',
        minimum_age: ''
      };

      request.post('/api/events/' + events[0].id + '/purchasables')
        .set('Authorization', generatedUsers.admin.token)
        .send(postData)
        .expect(status.BAD_REQUEST, done);
    });

    it('should be created with whether the item has a size', function (done) {
      var postData = {
        item: 'T-Shirt',
        price: '10.00',
        has_size: true
      };

      request.post('/api/events/' + events[0].id + '/purchasables')
        .set('Authorization', generatedUsers.admin.token)
        .send(postData)
        .expect(status.CREATED)
        .end(function (err, res) {
          if (err) return done(err);
          var purchasable = res.body.purchasables[0];
          expect(purchasable.item).to.equal(postData.item);
          expect(purchasable.price).to.equal(postData.price);
          expect(purchasable.has_size).to.be.true;
          return done();
        });
    });

    it('should not allow size as an empty string', function (done) {
      var postData = {
        item: 'Youth Lunch',
        price: '10.00',
        has_size: ''
      };

      request.post('/api/events/' + events[0].id + '/purchasables')
        .set('Authorization', generatedUsers.admin.token)
        .send(postData)
        .expect(status.BAD_REQUEST, done);
    });

    it('should be created with a minimum', function (done) {
      var postData = {
        item: 'Adult Lunch',
        price: '12.00',
        minimum_age: 10
      };

      request.post('/api/events/' + events[0].id + '/purchasables')
        .set('Authorization', generatedUsers.admin.token)
        .send(postData)
        .expect(status.CREATED)
        .end(function (err, res) {
          if (err) return done(err);
          var purchasable = res.body.purchasables[0];
          expect(purchasable.item).to.equal(postData.item);
          expect(purchasable.price).to.equal(postData.price);
          expect(purchasable.minimum_age).to.equal(postData.minimum_age);
          return done();
        });
    });

    it('should create with an age range', function (done) {
      var postData = {
        item: 'Teen Lunch',
        price: '12.00',
        minimum_age: 12,
        maximum_age: 18
      };

      request.post('/api/events/' + events[0].id + '/purchasables')
        .set('Authorization', generatedUsers.admin.token)
        .send(postData)
        .expect(status.CREATED)
        .end(function (err, res) {
          if (err) return done(err);
          var purchasable = res.body.purchasables[0];
          expect(purchasable.item).to.equal(postData.item);
          expect(purchasable.price).to.equal(postData.price);
          expect(purchasable.minimum_age).to.equal(postData.minimum_age);
          expect(purchasable.maximum_age).to.equal(postData.maximum_age);
          return done();
        });
    });

    it('should not create with an invalid range', function (done) {
      var postData = {
        item: 'Teen Lunch',
        price: '12.00',
        minimum_age: 18,
        maximum_age: 12
      };

      request.post('/api/events/' + events[0].id + '/purchasables')
        .set('Authorization', generatedUsers.admin.token)
        .send(postData)
        .expect(status.BAD_REQUEST, done);
    });

    it('should not allow an invalid age', function (done) {
      var postData = {
        item: 'Teen Lunch',
        price: '12.00',
        minimum_age: 'twelve'
      };

      request.post('/api/events/' + events[0].id + '/purchasables')
        .set('Authorization', generatedUsers.admin.token)
        .send(postData)
        .expect(status.BAD_REQUEST, done);
    });

    it('should not create with invalid data', function (done) {
      request.post('/api/events/' + events[0].id + '/purchasables')
        .set('Authorization', generatedUsers.admin.token)
        .send({
          item: 'Blank'
        })
        .expect(status.BAD_REQUEST, done);
    });

    it('should require admin authorization', function (done) {
      request.post('/api/events/' + events[0].id + '/purchasables')
        .set('Authorization', generatedUsers.teacher.token)
        .expect(status.UNAUTHORIZED, done);
    });

    it('should not create for a bad event', function (done) {
      request.post('/api/events/' + badId + '/purchasables')
        .set('Authorization', generatedUsers.admin.token)
        .expect(status.BAD_REQUEST, done);
    });
  });

  describe('when purchasables exist', function () {
    var purchasableIds;

    beforeEach(function (done) {
      async.series([
        function (cb) {
          purchasableIds = [];
          utils.dropTable(['Purchasable'], cb);
        },
        function (cb) {
          request.post('/api/events/' + events[0].id + '/purchasables')
            .set('Authorization', generatedUsers.admin.token)
            .send({
              item: 'T-Shirt',
              price: '15.00',
              has_size: true
            })
            .expect(status.CREATED)
            .end(function (err, res) {
              if (err) return done(err);
              purchasableIds.push(res.body.purchasables[0].id);
              return cb();
            });
        },
        function (cb) {
          request.post('/api/events/' + events[0].id + '/purchasables')
            .set('Authorization', generatedUsers.admin.token)
            .send({
              item: 'Badge',
              price: '3.50'
            })
            .expect(status.CREATED)
            .end(function (err, res) {
              if (err) return done(err);
              purchasableIds.push(res.body.purchasables[1].id);
              return cb();
            });
        },
        function (cb) {
          request.post('/api/events/' + events[1].id + '/purchasables')
            .set('Authorization', generatedUsers.admin.token)
            .send({
              item: 'T-Shirt',
              price: '10.00',
              has_size: true
            })
            .expect(status.CREATED)
            .end(function (err, res) {
              if (err) return done(err);
              purchasableIds.push(res.body.purchasables[0].id);
              return cb();
            });
        },
        function (cb) {
          request.post('/api/events/' + events[1].id + '/purchasables')
            .set('Authorization', generatedUsers.admin.token)
            .send({
              item: 'Youth Lunch',
              price: '10.00',
              maximum_age: 10
            })
            .expect(status.CREATED)
            .end(function (err, res) {
              if (err) return done(err);
              purchasableIds.push(res.body.purchasables[1].id);
              return cb();
            });
        }
      ], done);
    });

    describe('getting purchasables', function () {
      it('should show purchasables for an event', function (done) {
        request.get('/api/events/' + events[0].id + '/purchasables')
          .expect(status.OK)
          .end(function (err, res) {
            if (err) return done(err);
            var purchasables = res.body;
            expect(purchasables).to.have.length(2);
            expect(purchasables[0].id).to.equal(purchasableIds[0]);
            expect(purchasables[0].item).to.equal('T-Shirt');
            expect(purchasables[0].has_size).to.be.true;
            expect(purchasables[1].id).to.equal(purchasableIds[1]);
            expect(purchasables[1].item).to.equal('Badge');
            return done();
          });
      });

      it('should get different purchasables for a second event', function (done) {
        request.get('/api/events/' + events[1].id + '/purchasables')
          .expect(status.OK)
          .end(function (err, res) {
            if (err) return done(err);
            var purchasables = res.body;
            expect(purchasables).to.have.length(2);
            expect(purchasables[0].id).to.equal(purchasableIds[2]);
            expect(purchasables[0].item).to.equal('T-Shirt');
            expect(purchasables[0].has_size).to.be.true;
            expect(purchasables[1].id).to.equal(purchasableIds[3]);
            expect(purchasables[1].item).to.equal('Youth Lunch');
            expect(purchasables[1].maximum_age).to.equal(10);
            return done();
          });
      });

      it('should include purchasables for all events', function (done) {
        request.get('/api/events/')
          .expect(status.OK)
          .end(function (err, res) {
            if (err) return done(err);
            var events = res.body;
            expect(events).to.have.length(2);
            expect(events[0].purchasables).to.have.length(2);
            expect(events[1].purchasables).to.have.length(2);
            return done();
          });
      });

      it('should not get purchasables for a bad event', function (done) {
        request.get('/api/events/' + badId + '/purchasables')
          .expect(status.BAD_REQUEST, done);
      });
    });

    describe('updating purchasables', function () {
      it('should update an existing purchasable', function (done) {
        request.put('/api/events/' + events[0].id + '/purchasables/' + purchasableIds[0])
          .set('Authorization', generatedUsers.admin.token)
          .send({
            item: 'T-Shirt',
            price: '10.00',
            has_size: false
          })
          .expect(status.OK)
          .end(function (err, res) {
            if (err) return done(err);
            var purchasable = res.body.purchasable;
            expect(purchasable.id).to.equal(purchasableIds[0]);
            expect(purchasable.item).to.equal('T-Shirt');
            expect(purchasable.price).to.equal('10.00');
            expect(purchasable.has_size).to.be.false;
            return done();
          });
      });

      it('should update an age requirement', function (done) {
        request.put('/api/events/' + events[1].id + '/purchasables/' + purchasableIds[3])
          .set('Authorization', generatedUsers.admin.token)
          .send({
            maximum_age: 8
          })
          .expect(status.OK)
          .end(function (err, res) {
            if (err) return done(err);
            var purchasable = res.body.purchasable;
            expect(purchasable.id).to.equal(purchasableIds[3]);
            expect(purchasable.item).to.equal('Youth Lunch');
            expect(purchasable.maximum_age).to.equal(8);
            return done();
          });
      });

      it('should update with new information', function (done) {
        request.put('/api/events/' + events[0].id + '/purchasables/' + purchasableIds[0])
          .set('Authorization', generatedUsers.admin.token)
          .send({
            item: 'T-Shirt',
            description: 'New description',
            price: '10.00'
          })
          .expect(status.OK)
          .end(function (err, res) {
            if (err) return done(err);
            var purchasable = res.body.purchasable;
            expect(purchasable.id).to.equal(purchasableIds[0]);
            expect(purchasable.item).to.equal('T-Shirt');
            expect(purchasable.description).to.equal('New description');
            expect(purchasable.price).to.equal('10.00');
            return done();
          });

      });

      it('should not update without required fields', function (done) {
        request.put('/api/events/' + events[0].id + '/purchasables/' + purchasableIds[0])
          .set('Authorization', generatedUsers.admin.token)
          .send({
            item: null,
            price: '10.00'
          })
          .expect(status.BAD_REQUEST, done);
      });

      it('should not update for an invalid event', function (done) {
        request.put('/api/events/' + badId + '/purchasables/' + purchasableIds[0])
          .set('Authorization', generatedUsers.admin.token)
          .send({
            item: 'T-Shirt',
            price: '10.00'
          })
          .expect(status.BAD_REQUEST, done);
      });

      it('should not update for an invalid purchasable', function (done) {
        request.put('/api/events/' + events[0].id + '/purchasables/' + badId)
          .set('Authorization', generatedUsers.admin.token)
          .send({
            item: 'T-Shirt',
            price: '10.00'
          })
          .expect(status.BAD_REQUEST, done);
      });

      it('should require admin privileges', function (done) {
        request.put('/api/events/' + events[0].id + '/purchasables/' + purchasableIds[0])
          .set('Authorization', generatedUsers.coordinator.token)
          .expect(status.UNAUTHORIZED, done);
      });

      it('should not create invalid fields', function (done) {
        request.put('/api/events/' + events[0].id + '/purchasables/' + purchasableIds[0])
          .set('Authorization', generatedUsers.admin.token)
          .send({
            item: 'T-Shirt',
            invalid: 'invalid',
            price: '10.00'
          })
          .expect(status.OK)
          .end(function (err, res) {
            if (err) return done(err);
            var purchasable = res.body.purchasable;
            expect(purchasable.invalid).to.not.exist;
            return done();
          });
      });
    });

    describe('deleting purchasables', function () {
      it('should delete purchasables from an event', function (done) {
        async.series([
          function (cb) {
            request.get('/api/events/' + events[0].id + '/purchasables')
              .expect(status.OK)
              .end(function (err, res) {
                if (err) return done(err);
                expect(res.body).to.have.length(2);
                return cb();
              });
          },
          function (cb) {
            request.del('/api/events/' + events[0].id + '/purchasables/' + purchasableIds[0])
              .set('Authorization', generatedUsers.admin.token)
              .expect(status.OK, cb);
          },
          function (cb) {
            request.get('/api/events/' + events[0].id + '/purchasables')
              .expect(status.OK)
              .end(function (err, res) {
                if (err) return done(err);
                expect(res.body).to.have.length(1);
                expect(res.body[0].id).to.equal(purchasableIds[1]);
                return cb();
              });
          }
        ], done);
      });

      it('should require admin privileges', function (done) {
        request.del('/api/events/' + events[0].id + '/purchasables/' + purchasableIds[0])
          .set('Authorization', generatedUsers.coordinator.token)
          .expect(status.UNAUTHORIZED, done);
      });

      it('should not delete from a bad event', function (done) {
        request.del('/api/events/' + badId + '/purchasables/' + purchasableIds[0])
          .set('Authorization', generatedUsers.admin.token)
          .expect(status.BAD_REQUEST, done);
      });
    });

    describe('associating purchasables to a registration', function () {
      var purchasables, registrationIds;

      beforeEach(function (done) {
        utils.dropTable(['Registration', 'Purchasable', 'Purchase', 'Scout'], done);
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

      beforeEach(function (done) {
        utils.createPurchasablesForEvent(events[0].id, function (err, items) {
          if (err) return done(err);
          purchasables = items;
          return done();
        });
      });

      describe('creating a purchase', function () {
        it('should associate the purchasable to an event', function (done) {
          var postData = {
            purchasable: purchasables[1].id,
            quantity: 3
          };

          request.post('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/purchases')
            .set('Authorization', generatedUsers.coordinator.token)
            .send(postData)
            .expect(status.CREATED)
            .end(function (err, res) {
              if (err) return done(err);
              expect(res.body.registration.purchases).to.have.length(1);
              var purchase = res.body.registration.purchases[0];
              expect(purchase.id).to.equal(postData.purchasable);
              expect(purchase.details.quantity).to.equal(postData.quantity);
              expect(purchase.details.size).to.not.exist;
              return done();
            });
        });

        it('should allow a scout that is in the valid age range', function (done) {
          var validPurchaseId;
          async.series([
            function (cb) {
              var postData = {
                item: 'Adult Lunch With Age',
                price: '12.00',
                minimum_age: 0
              };

              request.post('/api/events/' + events[0].id + '/purchasables')
                .set('Authorization', generatedUsers.admin.token)
                .send(postData)
                .expect(status.CREATED)
                .end(function (err, res) {
                  if (err) return done(err);
                  expect(res.body.purchasables[4].item).to.equal(postData.item);
                  validPurchaseId = res.body.purchasables[4].id;
                  return cb();
                });
            },
            function (cb) {
              var postData = {
                purchasable: validPurchaseId
              };

              request.post('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/purchases')
                .set('Authorization', generatedUsers.coordinator.token)
                .send(postData)
                .expect(status.CREATED, cb);
            }
          ], done);
        });

        xit('should allow scouts to purchase an item multiple times', function (done) {
          var postData = {
            purchasable: purchasables[1].id,
            quantity: 3
          };

          async.series([
            function (cb) {
              request.post('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/purchases')
                .set('Authorization', generatedUsers.coordinator.token)
                .send(postData)
                .expect(status.CREATED, cb);
            },
            function (cb) {
              request.post('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/purchases')
                .set('Authorization', generatedUsers.coordinator.token)
                .send(postData)
                .expect(status.CREATED, cb);
            },
            function (cb) {
              request.get('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/purchases')
                .set('Authorization', generatedUsers.coordinator.token)
                .expect(status.OK)
                .end(function (err, res) {
                  if (err) return done(err);
                  var purchases = res.body;
                  expect(purchases).to.have.length(2);
                  return cb();
                });
            }
          ], done);
        });

        xit('should not allow a scout that is too old to purchase', function (done) {
          var invalidPurchaseId;
          async.series([
            function (cb) {
              var postData = {
                item: 'Youth Lunch With Age',
                price: '12.00',
                maximum_age: 0
              };

              request.post('/api/events/' + events[0].id + '/purchasables')
                .set('Authorization', generatedUsers.admin.token)
                .send(postData)
                .expect(status.CREATED)
                .end(function (err, res) {
                  if (err) return done(err);
                  expect(res.body.purchasables[4].item).to.equal(postData.item);
                  invalidPurchaseId = res.body.purchasables[4].id;
                  return cb();
                });
            },
            function (cb) {
              var postData = {
                purchasable: invalidPurchaseId
              };

              request.post('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/purchases')
                .set('Authorization', generatedUsers.coordinator.token)
                .send(postData)
                .expect(status.BAD_REQUEST, cb);
            }
          ], done);
        });

        it('should default to 0 for quantity', function (done) {
          var postData = {
            purchasable: purchasables[0].id
          };

          request.post('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/purchases')
            .set('Authorization', generatedUsers.coordinator.token)
            .send(postData)
            .expect(status.CREATED)
            .end(function (err, res) {
              if (err) return done(err);
              expect(res.body.registration.purchases).to.have.length(1);
              var purchase = res.body.registration.purchases[0];
              expect(purchase.id).to.equal(postData.purchasable);
              expect(purchase.details.quantity).to.equal(0);
              expect(purchase.details.size).to.not.exist;
              return done();
            });
        });

        it('should accept a size', function (done) {
          var postData = {
            purchasable: purchasables[0].id,
            size: 'l',
            quantity: 2
          };

          request.post('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/purchases')
            .set('Authorization', generatedUsers.coordinator.token)
            .send(postData)
            .expect(status.CREATED)
            .end(function (err, res) {
              if (err) return done(err);
              expect(res.body.registration.purchases).to.have.length(1);
              var purchase = res.body.registration.purchases[0];
              expect(purchase.id).to.equal(postData.purchasable);
              expect(purchase.details.quantity).to.equal(postData.quantity);
              expect(purchase.details.size).to.equal(postData.size);
              return done();
            });
        });

        it('should check for the scouts owner', function (done) {
          var postData = {
            purchasable: purchasables[0].id,
            size: 'l',
            quantity: 2
          };

          request.post('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/purchases')
            .set('Authorization', generatedUsers.coordinator2.token)
            .send(postData)
            .expect(status.UNAUTHORIZED, done);
        });

        it('should not allow teachers to create', function (done) {
          var postData = {
            purchasable: purchasables[0].id,
            size: 'l',
            quantity: 2
          };

          request.post('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/purchases')
            .set('Authorization', generatedUsers.teacher.token)
            .send(postData)
            .expect(status.UNAUTHORIZED, done);
        });

        it('should allow admins to create', function (done) {
          var postData = {
            purchasable: purchasables[0].id,
            size: 'l',
            quantity: 2
          };

          request.post('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/purchases')
            .set('Authorization', generatedUsers.admin.token)
            .send(postData)
            .expect(status.CREATED, done);
        });

        it('should not create for a nonexistant purchasable', function (done) {
          var postData = {
            purchasable: utils.badId,
            quantity: 1
          };

          request.post('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/purchases')
            .set('Authorization', generatedUsers.coordinator.token)
            .send(postData)
            .expect(status.BAD_REQUEST, done);
        });

        it('should not create for a nonexistant registration', function (done) {
          var postData = {
            purchasable: purchasables[0].id,
            quantity: 1
          };

          request.post('/api/scouts/' + scoutId + '/registrations/' + utils.badId + '/purchases')
            .set('Authorization', generatedUsers.coordinator.token)
            .send(postData)
            .expect(status.BAD_REQUEST, done);
        });

        it('should not create for a nonexistant scout', function (done) {
          var postData = {
            purchasable: purchasables[0].id,
            quantity: 1
          };

          request.post('/api/scouts/' + utils.badId + '/registrations/' + registrationIds[0] + '/purchases')
            .set('Authorization', generatedUsers.coordinator.token)
            .send(postData)
            .expect(status.BAD_REQUEST, done);
        });
      });

      describe('when purchases already exist', function () {
        beforeEach(function (done) {
          async.series([
            function (cb) {
              request.post('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/purchases')
                .set('Authorization', generatedUsers.coordinator.token)
                .send({
                  purchasable: purchasables[0].id,
                  size: 'l',
                  quantity: 2
                })
                .expect(status.CREATED, cb);
            },
            function (cb) {
              request.post('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/purchases')
                .set('Authorization', generatedUsers.coordinator.token)
                .send({
                  purchasable: purchasables[1].id,
                  quantity: 1
                })
                .expect(status.CREATED, cb);
            },
            function (cb) {
              request.post('/api/scouts/' + scoutId + '/registrations/' + registrationIds[1] + '/purchases')
                .set('Authorization', generatedUsers.coordinator.token)
                .send({
                  purchasable: purchasables[3].id,
                  quantity: 5
                })
                .expect(status.CREATED, cb);
            }
          ], done);
        });

        describe('getting purchases', function () {
          it('should get all purchases for a registration', function (done) {
            request.get('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/purchases')
              .set('Authorization', generatedUsers.coordinator.token)
              .expect(status.OK)
              .end(function (err, res) {
                if (err) return done(err);
                var purchases = res.body;
                expect(purchases).to.have.length(2);
                expect(purchases[0].id).to.equal(purchasables[0].id);
                expect(purchases[0].details.size).to.equal('l');
                expect(purchases[0].details.quantity).to.equal(2);
                expect(purchases[1].id).to.equal(purchasables[1].id);
                expect(purchases[1].details.quantity).to.equal(1);
                expect(purchases[1].details.size).to.not.exist;
                return done();
              });
          });

          it('should not get with an incorrect scout', function (done) {
            request.get('/api/scouts/' + badId + '/registrations/' + registrationIds[0] + '/purchases')
              .set('Authorization', generatedUsers.coordinator.token)
              .expect(status.BAD_REQUEST, done);
          });

          it('should not get with an incorrect registration', function (done) {
            request.get('/api/scouts/' + generatedScouts[0].id + '/registrations/' + badId + '/purchases')
              .set('Authorization', generatedUsers.coordinator.token)
              .expect(status.BAD_REQUEST, done);
          });
        });

        describe('updating purchases', function () {
          it('should update a purchase', function (done) {
            async.series([
              function (cb) {
                request.get('/api/scouts/' + generatedScouts[0].id + '/registrations/' + registrationIds[0] + '/purchases')
                  .set('Authorization', generatedUsers.coordinator.token)
                  .expect(status.OK)
                  .end(function (err, res) {
                    if (err) return done(err);
                    expect(res.body[0].details.quantity).to.equal(2);
                    return cb();
                  });
              },
              function (cb) {
                request.put('/api/scouts/' + generatedScouts[0].id + '/registrations/' + registrationIds[0] + '/purchases/' + purchasables[0].id)
                  .set('Authorization', generatedUsers.coordinator.token)
                  .send({
                    quantity: 1
                  })
                  .expect(status.OK, cb);
              },
              function (cb) {
                request.get('/api/scouts/' + generatedScouts[0].id + '/registrations/' + registrationIds[0] + '/purchases')
                  .set('Authorization', generatedUsers.coordinator.token)
                  .expect(status.OK)
                  .end(function (err, res) {
                    if (err) return done(err);
                    expect(res.body[0].details.quantity).to.equal(1);
                    return cb();
                  });
              }
            ], done);
          });

          it('should check for the scouts owner', function (done) {
            request.put('/api/scouts/' + generatedScouts[0].id + '/registrations/' + registrationIds[0] + '/purchases/' + purchasables[0].id)
              .set('Authorization', generatedUsers.coordinator2.token)
              .send({
                quantity: 1
              })
              .expect(status.UNAUTHORIZED, done);
          });

          it('should not allow teachers to update', function (done) {
            request.put('/api/scouts/' + generatedScouts[0].id + '/registrations/' + registrationIds[0] + '/purchases/' + purchasables[0].id)
              .set('Authorization', generatedUsers.teacher.token)
              .send({
                quantity: 1
              })
              .expect(status.UNAUTHORIZED, done);
          });

          it('should allow admins to update', function (done) {
            request.put('/api/scouts/' + generatedScouts[0].id + '/registrations/' + registrationIds[0] + '/purchases/' + purchasables[0].id)
              .set('Authorization', generatedUsers.admin.token)
              .send({
                quantity: 1
              })
              .expect(status.OK, done);
          });

          it('should not update an invalid purchase', function (done) {
            request.put('/api/scouts/' + generatedScouts[0].id + '/registrations/' + registrationIds[0] + '/purchases/' + utils.badId)
              .set('Authorization', generatedUsers.coordinator.token)
              .send({
                quantity: 1
              })
              .expect(status.BAD_REQUEST, done);
          });

          it('should not update an invalid registration', function (done) {
            request.put('/api/scouts/' + generatedScouts[0].id + '/registrations/' + utils.badId + '/purchases/' + purchasables[0].id)
              .set('Authorization', generatedUsers.coordinator.token)
              .send({
                quantity: 1
              })
              .expect(status.BAD_REQUEST, done);
          });

          it('should not update an invalid scout', function (done) {
            request.put('/api/scouts/' + utils.badId + '/registrations/' + registrationIds[0] + '/purchases/' + purchasables[0].id)
              .set('Authorization', generatedUsers.coordinator.token)
              .send({
                quantity: 1
              })
              .expect(status.BAD_REQUEST, done);
          });

          it('should not update a purchase for the wrong registration', function (done) {
            request.put('/api/scouts/' + generatedScouts[0].id + '/registrations/' + registrationIds[0] + '/purchases/' + purchasables[3].id)
              .set('Authorization', generatedUsers.coordinator.token)
              .send({
                quantity: 1
              })
              .expect(status.BAD_REQUEST, done);
          });

          it('should not allow a required value to be unset', function (done) {
            request.put('/api/scouts/' + generatedScouts[0].id + '/registrations/' + registrationIds[0] + '/purchases/' + purchasables[0].id)
              .set('Authorization', generatedUsers.coordinator.token)
              .send({
                quantity: null
              })
              .expect(status.BAD_REQUEST, done);
          });
        });

        describe('deleting purchases', function () {
          it('should delete a purchase', function (done) {
            async.series([
              function (cb) {
                request.get('/api/scouts/' + generatedScouts[0].id + '/registrations/' + registrationIds[0] + '/purchases')
                  .set('Authorization', generatedUsers.coordinator.token)
                  .expect(status.OK)
                  .end(function (err, res) {
                    if (err) return done(err);
                    expect(res.body).to.have.length(2);
                    return cb();
                  });
              },
              function (cb) {
                request.del('/api/scouts/' + generatedScouts[0].id + '/registrations/' + registrationIds[0] + '/purchases/' + purchasables[0].id)
                  .set('Authorization', generatedUsers.coordinator.token)
                  .expect(status.OK, cb);
              },
              function (cb) {
                request.get('/api/scouts/' + generatedScouts[0].id + '/registrations/' + registrationIds[0] + '/purchases')
                  .set('Authorization', generatedUsers.coordinator.token)
                  .expect(status.OK)
                  .end(function (err, res) {
                    if (err) return done(err);
                    expect(res.body).to.have.length(1);
                    return cb();
                  });
              }
            ], done);
          });

          it('should check for the scouts owner', function (done) {
            request.del('/api/scouts/' + generatedScouts[0].id + '/registrations/' + registrationIds[0] + '/purchases/' + purchasables[0].id)
              .set('Authorization', generatedUsers.coordinator2.token)
              .expect(status.UNAUTHORIZED, done);
          });

          it('should not allow teachers to delete', function (done) {
            request.del('/api/scouts/' + generatedScouts[0].id + '/registrations/' + registrationIds[0] + '/purchases/' + purchasables[0].id)
              .set('Authorization', generatedUsers.teacher.token)
              .expect(status.UNAUTHORIZED, done);
          });

          it('should allow admins to delete', function (done) {
            request.del('/api/scouts/' + generatedScouts[0].id + '/registrations/' + registrationIds[0] + '/purchases/' + purchasables[0].id)
              .set('Authorization', generatedUsers.admin.token)
              .expect(status.OK, done);
          });

          it('should not delete an invalid purchase', function (done) {
            request.del('/api/scouts/' + generatedScouts[0].id + '/registrations/' + registrationIds[0] + '/purchases/' + utils.badId)
              .set('Authorization', generatedUsers.coordinator.token)
              .expect(status.BAD_REQUEST, done);
          });

          it('should not delete an invalid registration', function (done) {
            request.del('/api/scouts/' + generatedScouts[0].id + '/registrations/' + utils.badId + '/purchases/' + purchasables[0].id)
              .set('Authorization', generatedUsers.coordinator.token)
              .expect(status.BAD_REQUEST, done);
          });

          it('should not delete an invalid scout', function (done) {
            request.del('/api/scouts/' + utils.badId + '/registrations/' + registrationIds[0] + '/purchases/' + purchasables[0].id)
              .set('Authorization', generatedUsers.coordinator.token)
              .expect(status.BAD_REQUEST, done);
          });

          it('should not delete a purchase for the wrong registration', function (done) {
            request.del('/api/scouts/' + generatedScouts[0].id + '/registrations/' + registrationIds[0] + '/purchases/' + purchasables[3].id)
              .set('Authorization', generatedUsers.coordinator.token)
              .expect(status.BAD_REQUEST, done);
          });
        });
      });
    });
  });
});
