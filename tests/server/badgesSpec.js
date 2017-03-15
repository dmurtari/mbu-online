var app = require('../../src/app');
var request = require('supertest')(app);
var async = require('async');
var status = require('http-status-codes');
var should = require('should');
var _ = require('lodash');
var faker = require('faker');

var testUtils = require('./testUtils');

describe('merit badges', function() {
  var token;

  // Create a user with permission to create badges before running tests. Only
  // do this once to avoid overhead of creating a user for each test.
 before(function (done) {
    testUtils.generateToken('admin', function (err, genToken) {
      token = genToken;
      done();
    });
  });

  // Make sure the badge collection doesn't exist before each tests. Don't drop the entire
  // db, because then the user would need to be created again
  beforeEach(function(done) {
    testUtils.dropTable(['Badge'], done);
  });

  after(function(done) {
    testUtils.dropDb(done);
  });

  describe('creating merit badges', function() {
    var testBadge =  {
        name: 'Test',
        description: 'A very good badge',
        notes: 'Eagle'
    };

    it('should create badges with names', function(done) {
      var postData = {
        name: 'Test'
      };

      request.post('/api/badges')
        .set('Authorization', token)
        .send(postData)
        .expect(status.CREATED, done);
    });

    it('should require authentication', function(done) {
      var postData = testBadge;

      request.post('/api/badges')
        .send(postData)
        .expect(status.UNAUTHORIZED, done);
    });

    it('should require name', function(done) {
      var postData = {
        description: 'No name'
      };

      request.post('/api/badges')
        .set('Authorization', token)
        .send(postData)
        .expect(status.BAD_REQUEST, done);
    });

    it('should not allow blank names', function(done) {
      var postData = {
        name: ''
      };

      request.post('/api/badges')
        .set('Authorization', token)
        .send(postData)
        .expect(status.BAD_REQUEST, done);
    });

    it('should allow long details', function(done) {
      var postData = {
        name: 'Swimming',
        description: 'Swimming is a leisure activity, a competitive sport, and a basic survival skill. Scouts who earn this badge will learn about safety when swimming and diving, how swimming can contribute to overall fitness and health, and gain some basic competitive swimming skills'
      };

      request.post('/api/badges')
        .set('Authorization', token)
        .send(postData)
        .expect(status.CREATED, done);
    });

    it('should not allow duplicate names', function(done) {
      async.series([
        function(cb) {
          request.post('/api/badges')
            .set('Authorization', token)
            .send(testBadge)
            .expect(status.CREATED, cb);
        },
        function(cb) {
          request.post('/api/badges')
            .set('Authorization', token)
            .send(testBadge)
            .expect(status.BAD_REQUEST, cb);
        }
      ], done);
    });

    it('should ignore extra fields', function(done) {
      var postData = {
        name: 'Test',
        birthday: 'Nonsense'
      };

      request.post('/api/badges')
        .set('Authorization', token)
        .send(postData)
        .expect(status.CREATED)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.badge.name.should.equal(postData.name);
          should.not.exist(res.body.badge.birthday);
          done();
        });
    });
  });

  describe('getting merit badges', function() {
    var id;

    var test1 = {
      name: 'Test',
      description: 'A test',
      notes: 'Notes'
    };

    var test2 = {
      name: 'Test 2',
      description: 'A second test'
    };

    beforeEach(function(done) {
      request.post('/api/badges')
        .set('Authorization', token)
        .send(test1)
        .expect(status.CREATED)
        .end(function(err, res) {
          if (err) return done(err);
          id = res.body.badge.id;
          done();
        });
    });

    it('should be able to get a badge by id', function(done) {
      request.get('/api/badges?id=' + id)
        .expect(status.OK)
        .end(function(err, res) {
          if (err) return done(err);
          var badge = res.body[0];
          badge.name.should.equal(test1.name);
          badge.description.should.equal(test1.description);
          badge.notes.should.equal(test1.notes);
          done();
        });
    });

    it('should be able to get a badge by name', function(done) {
      request.get('/api/badges?name=' + test1.name)
        .expect(status.OK)
        .end(function(err, res) {
          if (err) return done(err);
          var badge = res.body[0];
          badge.name.should.equal(test1.name);
          badge.description.should.equal(test1.description);
          badge.notes.should.equal(test1.notes);
          done();
        });
    });

    it('should respond with all badges if no query is supplied', function(done) {
      async.series([
        function(cb) {
          request.post('/api/badges')
            .set('Authorization', token)
            .send(test2)
            .expect(status.CREATED)
            .end(function(err) {
              if (err) return done(err);
              cb();
            });
        },
        function(cb) {
          request.get('/api/badges')
            .expect(status.OK)
            .end(function(err, res) {
              if (err) return done(err);
              var badges = res.body;
              badges.length.should.equal(2);
              cb();
            });
        }
      ], done);
    });

    it('should fail gracefully if incorrect arguments are supplied', function(done) {
      request.get('/api/badges?wrong=hello')
        .expect(status.OK, done);
    });

    it('should not fail if a badge does not exist does not exist', function(done) {
      request.get('/api/badges?name=dne')
        .expect(status.NOT_FOUND, done);
    });
  });

  describe('removing a merit badge', function() {
    var id;

    it('should remove a badge with a given id', function(done) {
      var badge = {
        name: 'Test'
      };

      async.series([
        function(cb) {
          request.post('/api/badges')
            .set('Authorization', token)
            .send(badge)
            .expect(status.CREATED)
            .end(function(err, res) {
              if (err) return done(err);
              id = res.body.badge.id;
              cb();
            });
        },
        function(cb) {
          request.del('/api/badges/' + id)
            .set('Authorization', token)
            .expect(status.OK, cb);
        },
        function(cb) {
          request.get('/api/badges?id=' + id)
            .expect(status.NOT_FOUND, cb);
        }
      ], done);
    });

    it('should fail gracefully if a badge is not found with a valid id form', function(done) {
      request.del('/api/badges/123123')
        .set('Authorization', token)
        .expect(status.BAD_REQUEST, done);
    });

    it('should fail gracefully if a valid id is not supplied', function(done) {
      request.del('/api/badges/invalidid')
        .set('Authorization', token)
        .expect(status.BAD_REQUEST, done);
    });

    it('should fail gracefully if delete is sent to the wrong endpoint', function(done) {
      request.del('/api/badges')
        .set('Authorization', token)
        .expect(status.NOT_FOUND, done);
    });
  });

  describe('editing a merit badge', function() {
    var id;

    var badge = {
      name: 'Test',
      description: 'What',
      notes: 'Note'
    };

    it('should update a badge with all fields', function(done) {
      var badgeUpdate = {
        name: 'Test updated',
        description: 'New',
        notes: 'Updated'
      };

      async.series([
        function(cb) {
          request.post('/api/badges')
            .set('Authorization', token)
            .send(badge)
            .expect(status.CREATED)
            .end(function(err, res) {
              if (err) return done(err);
              id = res.body.badge.id;
              cb();
            });
        },
        function(cb) {
          request.put('/api/badges/' + id)
            .set('Authorization', token)
            .send(badgeUpdate)
            .expect(status.OK)
            .end(function(err, res) {
              if (err) return done(err);
              res.body.badge.name.should.equal(badgeUpdate.name);
              res.body.badge.description.should.equal(badgeUpdate.description);
              res.body.badge.notes.should.equal(badgeUpdate.notes);
              res.body.badge.id.should.equal(id);
              cb();
            });
        }
      ], done);
    });

    it('should update a badge with partial fields', function(done) {
      var badgeUpdate = {
        name: 'Test updated'
      };

      async.series([
        function(cb) {
          request.post('/api/badges')
            .set('Authorization', token)
            .send(badge)
            .expect(status.CREATED)
            .end(function(err, res) {
              if (err) return done(err);
              id = res.body.badge.id;
              cb();
            });
        },
        function(cb) {
          request.put('/api/badges/' + id)
            .set('Authorization', token)
            .send(badgeUpdate)
            .expect(status.OK)
            .end(function(err, res) {
              if (err) return done(err);
              res.body.badge.name.should.equal(badgeUpdate.name);
              res.body.badge.id.should.equal(id);
              res.body.badge.description.should.exist;
              res.body.badge.notes.should.exist;
              cb();
            });
        }
      ], done);
    });

    it('should fail gracefully if required fields are not supplied', function(done) {
      var badgeUpdate = {
        name: null,
        description: 'New',
        notes: 'Updated'
      };

      async.series([
        function(cb) {
          request.post('/api/badges')
            .set('Authorization', token)
            .send(badge)
            .expect(status.CREATED)
            .end(function(err, res) {
              if (err) return done(err);
              id = res.body.badge.id;
              cb();
            });
        },
        function(cb) {
          request.put('/api/badges/' + id)
            .set('Authorization', token)
            .send(badgeUpdate)
            .expect(status.BAD_REQUEST, cb);
        }
      ], done);
    });

    it('should not allow badges to be modified to be duplicates', function(done) {
      var id2;
      var badge2 = _.clone(badge);
      badge2.name = 'Different';

      async.series([
        function(cb) {
          request.post('/api/badges')
            .set('Authorization', token)
            .send(badge)
            .expect(status.CREATED)
            .end(function(err, res) {
              if (err) return done(err);
              id = res.body.badge.id;
              cb();
            });
        },
        function(cb) {
          request.post('/api/badges')
            .set('Authorization', token)
            .send(badge2)
            .expect(status.CREATED)
            .end(function(err, res) {
              if (err) return done(err);
              id2 = res.body.badge.id;
              cb();
            });
        },
        function(cb) {
          request.put('/api/badges/' + id2)
            .set('Authorization', token)
            .send(badge)
            .expect(status.BAD_REQUEST, cb);
        }
      ], done);
    });

    it('should not edit the badge if no fields are supplied', function(done) {
      async.series([
        function(cb) {
          request.post('/api/badges')
            .set('Authorization', token)
            .send(badge)
            .expect(status.CREATED)
            .end(function(err, res) {
              if (err) return done(err);
              id = res.body.badge.id;
              cb();
            });
        },
        function(cb) {
          request.put('/api/badges/' + id)
            .set('Authorization', token)
            .send({})
            .expect(status.OK, function(err, res) {
              if (err) return err;
              res.body.badge.id.should.equal(id);
              res.body.badge.name.should.equal(badge.name);
              res.body.badge.description.should.equal(badge.description);
              res.body.badge.notes.should.equal(badge.notes);
              cb();
            });
        }
      ], done);
    });

    it('should fail gracefully if the badge is not found', function(done) {
      async.series([
        function(cb) {
          request.post('/api/badges')
            .set('Authorization', token)
            .send(badge)
            .expect(status.CREATED)
            .end(function(err, res) {
              if (err) return done(err);
              id = res.body.badge.id;
              cb();
            });
        },
        function(cb) {
          request.put('/api/badges/123456789012345678901234')
            .set('Authorization', token)
            .send({
              name: 'DNE'
            })
            .expect(status.BAD_REQUEST, cb);
        }
      ], done);
    });

    it('should not edit the badge if an empty request is sent', function(done) {
      async.series([
        function(cb) {
          request.post('/api/badges')
            .set('Authorization', token)
            .send(badge)
            .expect(status.CREATED)
            .end(function(err, res) {
              if (err) return done(err);
              id = res.body.badge.id;
              cb();
            });
        },
        function(cb) {
          request.put('/api/badges/' + id)
            .set('Authorization', token)
            .expect(status.OK, function(err, res) {
              if (err) return err;
              res.body.badge.id.should.equal(id);
              res.body.badge.name.should.equal(badge.name);
              res.body.badge.description.should.equal(badge.description);
              res.body.badge.notes.should.equal(badge.notes);
              cb();
            });
        }
      ], done);
    });

    it('should fail gracefully if no id is sent', function(done) {
      request.put('/api/badges/')
        .set('Authorization', token)
        .expect(status.NOT_FOUND, done);
    });

    it('should allow long details', function(done) {
      async.series([
        function(cb) {
          request.post('/api/badges')
            .set('Authorization', token)
            .send(badge)
            .expect(status.CREATED)
            .end(function(err, res) {
              if (err) return done(err);
              id = res.body.badge.id;
              cb();
            });
        },
        function(cb) {
          request.put('/api/badges/' + id)
            .set('Authorization', token)
            .send({
              description: faker.lorem.paragraph(3)
            })
            .expect(status.OK, cb);
        }
      ], done);
    });
  });
});
