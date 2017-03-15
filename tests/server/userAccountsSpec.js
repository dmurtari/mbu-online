var app = require('../../src/app');
var request = require('supertest')(app);
var async = require('async');
var status = require('http-status-codes');

var chai = require('chai');
var expect = chai.expect;

var utils = require('./testUtils');

describe('user profiles', function () {
  this.timeout(5000);
  var generatedUsers;

  beforeEach(function (done) {
    utils.dropDb(done);
  });

  beforeEach(function (done) {
    this.timeout(10000);
    utils.generateTokens(['admin', 'teacher', 'coordinator'], function (err, generatedTokens) {
      if (err) return done(err);
      generatedUsers = generatedTokens;
      return done();
    });
  });

  after(function (done) {
    utils.dropDb(done);
  });

  describe('account details', function () {
    it('creates an account with coordinator information', function (done) {
      var postData = {
        email: 'test@test.com',
        password: 'password',
        firstname: 'firstname',
        lastname: 'lastname',
        role: 'coordinator',
        details: {
          troop: 1,
          district: 'district',
          council: 'council'
        }
      };

      request.post('/api/signup')
        .send(postData)
        .expect(status.CREATED)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body.profile.email).to.equal(postData.email);
          expect(res.body.profile.firstname).to.equal(postData.firstname);
          expect(res.body.profile.lastname).to.equal(postData.lastname);
          expect(res.body.profile.password).to.not.exist;
          expect(res.body.token).to.exist;
          expect(res.body.profile.details).to.deep.equal(postData.details);
          return done();
        });
    });

    it('creates an account with teacher information', function (done) {
      var postData = {
        email: 'test@test.com',
        password: 'password',
        firstname: 'firstname',
        lastname: 'lastname',
        role: 'teacher',
        details: {
          chapter: 'chapter'
        }
      };

      request.post('/api/signup')
        .send(postData)
        .expect(status.CREATED)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body.profile.email).to.equal(postData.email);
          expect(res.body.profile.firstname).to.equal(postData.firstname);
          expect(res.body.profile.lastname).to.equal(postData.lastname);
          expect(res.body.profile.password).to.not.exist;
          expect(res.body.token).to.exist;
          expect(res.body.profile.details).to.deep.equal(postData.details);
          return done();
        });
    });

    it('does not create coordinator with teacher info', function (done) {
      var postData = {
        email: 'test@test.com',
        password: 'password',
        firstname: 'firstname',
        lastname: 'lastname',
        role: 'coordinator',
        details: {
          chapter: 'chapter'
        }
      };

      request.post('/api/signup')
        .send(postData)
        .expect(status.BAD_REQUEST, done);
    });

    it('does not create teacher with coordinator info', function (done) {
      var postData = {
        email: 'test@test.com',
        password: 'password',
        firstname: 'firstname',
        lastname: 'lastname',
        role: 'teacher',
        details: {
          troop: 1,
          district: 'district',
          council: 'council'
        }
      };

      request.post('/api/signup')
        .send(postData)
        .expect(status.BAD_REQUEST, done);
    });
  });

  describe('getting account details', function () {
    var user1, user2;

    beforeEach(function (done) {
      user1 = {
        email: 'test1@test.com',
        password: 'password',
        firstname: 'firstname',
        lastname: 'lastname',
        role: 'coordinator',
        details: {
          troop: 1,
          district: 'district',
          council: 'council'
        }
      };

      user2 = {
        email: 'test2@test.com',
        password: 'password',
        firstname: 'firstname',
        lastname: 'lastname',
        role: 'coordinator',
        details: {
          troop: 2,
          district: 'district2',
          council: 'council2'
        }
      };

      async.series([
        function (cb) {
          request.post('/api/signup')
            .send(user1)
            .expect(status.CREATED)
            .end(function (err, res) {
              if (err) return done(err);
              user1.id = res.body.profile.id;
              user1.token = res.body.token;
              return cb();
            });
        },
        function (cb) {
          request.post('/api/signup')
            .send(user2)
            .expect(status.CREATED)
            .end(function (err, res) {
              if (err) return done(err);
              user2.id = res.body.profile.id;
              user2.token = res.body.token;
              return cb();
            });
        }
      ], done);
    });

    it('should not return the encrypted password', function (done) {
      request.get('/api/users/' + user1.id)
        .set('Authorization', user1.token)
        .expect(status.OK)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body.password).to.not.exist;
          return done();
        });
    });

    it('should get details for a user with their own token', function (done) {
      request.get('/api/users/' + user1.id)
        .set('Authorization', user1.token)
        .expect(status.OK)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body[0].id).to.equal(user1.id);
          expect(res.body[0].details).to.deep.equal(user1.details);
          return done();
        });
    });

    it('should get details for a user with an admin token', function (done) {
      request.get('/api/users/' + user1.id)
        .set('Authorization', generatedUsers.admin.token)
        .expect(status.OK)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body[0].id).to.equal(user1.id);
          expect(res.body[0].details).to.deep.equal(user1.details);
          return done();
        });
    });

    it('should get details for a user with a teacher token', function (done) {
      request.get('/api/users/' + user1.id)
        .set('Authorization', generatedUsers.teacher.token)
        .expect(status.OK)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body[0].id).to.equal(user1.id);
          expect(res.body[0].details).to.deep.equal(user1.details);
          return done();
        });
    });

    it('should not allow other users to see other profiles', function (done) {
      request.get('/api/users/' + user1.id)
        .set('Authorization', user2.token)
        .expect(status.UNAUTHORIZED, done);
    });

    it('should not allow other users to see other profiles with query', function (done) {
      request.get('/api/users?id=' + user1.id)
        .set('Authorization', user2.token)
        .expect(status.UNAUTHORIZED, done);
    });

    it('should not get details for an invalid user', function (done) {
      request.get('/api/users/wat')
        .set('Authorization', generatedUsers.admin.token)
        .expect(status.BAD_REQUEST, done);
    });
  });

  describe('editing account details', function () {
    var user1, user2;

    beforeEach(function (done) {
      user1 = {
        email: 'test1@test.com',
        password: 'password',
        firstname: 'firstname',
        lastname: 'lastname',
        role: 'coordinator',
        details: {
          troop: 1,
          district: 'district',
          council: 'council'
        }
      };

      user2 = {
        email: 'test2@test.com',
        password: 'password',
        firstname: 'firstname',
        lastname: 'lastname',
        role: 'teacher',
        details: {
          chapter: 'Book'
        }
      };

      async.series([
        function (cb) {
          request.post('/api/signup')
            .send(user1)
            .expect(status.CREATED)
            .end(function (err, res) {
              if (err) return done(err);
              user1.id = res.body.profile.id;
              user1.token = res.body.token;
              return cb();
            });
        },
        function (cb) {
          request.post('/api/signup')
            .send(user2)
            .expect(status.CREATED)
            .end(function (err, res) {
              if (err) return done(err);
              user2.id = res.body.profile.id;
              user2.token = res.body.token;
              return cb();
            });
        }
      ], done);
    });

    it('should edit a profile', function (done) {
      var edited = {
        firstname: 'changed',
        details: {
          troop: 1000
        }
      };

      request.put('/api/users/' + user1.id)
        .set('Authorization', user1.token)
        .send(edited)
        .expect(status.OK)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body.profile.id).to.equal(user1.id);
          expect(res.body.profile.firstname).to.equal(edited.firstname);
          expect(res.body.profile.lastname).to.equal(user1.lastname);
          expect(res.body.profile.details).to.deep.equal(edited.details);
          return done();
        });
    });

    it('should still login after editing a profile', function (done) {
      async.series([
        function (cb) {
          request.post('/api/authenticate')
            .send({
              email: user2.email,
              password: user2.password
            })
            .expect(status.OK, cb);
        },
        function (cb) {
          request.put('/api/users/' + user2.id)
            .set('Authorization', user2.token)
            .send({ firstname: 'New' })
            .expect(status.OK)
            .end(function (err) {
              if (err) return done(err);
              cb();
            });
        },
        function (cb) {
          request.post('/api/authenticate')
            .send({
              email: user2.email,
              password: user2.password
            })
            .expect(status.OK, cb);
        }
      ], done);
    });

    it('should not send a token if the password did not change', function (done) {
      request.put('/api/users/' + user1.id)
        .set('Authorization', user1.token)
        .send({ firstname: 'New' })
        .expect(status.OK)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body.token).to.not.exist;
          return done();
        });
    });

    it('should not allow invalid details', function (done) {
      request.put('/api/users/' + user2.id)
        .set('Authorization', user2.token)
        .send({
          details: { troop: 450 }
        })
        .expect(status.BAD_REQUEST, done);
    });

    it('should not allow other coordinators to edit a coordinator profile', function (done) {
      request.put('/api/users/' + user1.id)
        .set('Authorization', generatedUsers.coordinator.token)
        .expect(status.UNAUTHORIZED, done);
    });

    it('should not allow coordinators to edit a teacher profile', function (done) {
      request.put('/api/users/' + user2.id)
        .set('Authorization', user1.token)
        .expect(status.UNAUTHORIZED, done);
    });

    it('should allow admins to edit a profile', function (done) {
      request.put('/api/users/' + user1.id)
        .set('Authorization', generatedUsers.admin.token)
        .expect(status.OK, done);
    });

    it('should allow teachers to edit a profile', function (done) {
      request.put('/api/users/' + user1.id)
        .set('Authorization', generatedUsers.teacher.token)
        .expect(status.OK, done);
    });

    it('should change a password', function (done) {
      var newToken;
      var edit = {
        password: 'edited'
      };

      async.series([
        function (cb) {
          request.post('/api/authenticate')
            .send({
              email: user2.email,
              password: user2.password
            })
            .expect(status.OK, cb);
        },
        function (cb) {
          request.put('/api/users/' + user2.id)
            .set('Authorization', user2.token)
            .send(edit)
            .expect(status.OK)
            .end(function (err, res) {
              if (err) return done(err);
              newToken = res.body.token;
              cb();
            });
        },
        function (cb) {
          request.post('/api/authenticate')
            .send({
              email: user2.email,
              password: edit.password
            })
            .expect(status.OK, cb);
        },
        function (cb) {
          request.get('/api/profile')
            .set('Authorization', newToken)
            .expect(status.OK)
            .end(function (err, res) {
              if (err) return done(err);
              expect(res.body.profile.email).to.equal(user2.email);
              expect(res.body.profile.details).to.deep.equal(user2.details);
              return cb();
            });
        }
      ], done);
    });

    it('should allow admins to edit a role', function (done) {
      async.series([
        function (cb) {
          request.put('/api/users/' + user2.id)
            .set('Authorization', generatedUsers.admin.token)
            .send({ role: 'admin' })
            .expect(status.OK, cb);
        },
        function (cb) {
          request.get('/api/users/' + user2.id)
            .set('Authorization', user2.token)
            .expect(status.OK)
            .end(function (err, res) {
              if (err) return done(err);
              expect(res.body[0].id).to.equal(user2.id);
              expect(res.body[0].role).to.equal('admin');
              return cb();
            });
        }
      ], done);
    });

    it('should not allow teachers to edit a role', function (done) {
      request.put('/api/users/' + user2.id)
        .set('Authorization', generatedUsers.teacher.token)
        .send({ role: 'admin' })
        .expect(status.UNAUTHORIZED, done);
    });

    it('should not allow coordinators to edit a role', function (done) {
      request.put('/api/users/' + user2.id)
        .set('Authorization', generatedUsers.coordinator.token)
        .send({ role: 'admin' })
        .expect(status.UNAUTHORIZED, done);
    });

    it('should not allow self role edits', function (done) {
      request.put('/api/users/' + user2.id)
        .set('Authorization', user2.token)
        .send({ role: 'admin' })
        .expect(status.UNAUTHORIZED, done);
    });

    it('should not allow teachers to edit other passwords', function (done) {
      request.put('/api/users/' + user2.id)
        .set('Authorization', generatedUsers.teacher.token)
        .send({ password: 'oops' })
        .expect(status.UNAUTHORIZED, done);
    });

    it('should allow admins to edit a password', function (done) {
      request.put('/api/users/' + user2.id)
        .set('Authorization', generatedUsers.admin.token)
        .send({ password: 'oops' })
        .expect(status.OK, done);
    });

    it('should allow admins to edit a password', function (done) {
      request.put('/api/users/' + user2.id)
        .set('Authorization', generatedUsers.admin.token)
        .send({ password: 'new' })
        .expect(status.OK)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body.token).to.exist;
          done();
        });
    });
  });

  describe('deleting accounts', function () {
    var coordinator, teacher;

    beforeEach(function (done) {
      coordinator = {
        email: 'test1@test.com',
        password: 'password',
        firstname: 'firstname',
        lastname: 'lastname',
        role: 'coordinator',
        details: {
          troop: 1,
          district: 'district',
          council: 'council'
        }
      };

      teacher = {
        email: 'test2@test.com',
        password: 'password',
        firstname: 'firstname',
        lastname: 'lastname',
        role: 'teacher',
        details: {
          chapter: 'Book'
        }
      };

      async.series([
        function (cb) {
          request.post('/api/signup')
            .send(coordinator)
            .expect(status.CREATED)
            .end(function (err, res) {
              if (err) return done(err);
              coordinator.id = res.body.profile.id;
              coordinator.token = res.body.token;
              return cb();
            });
        },
        function (cb) {
          request.post('/api/signup')
            .send(teacher)
            .expect(status.CREATED)
            .end(function (err, res) {
              if (err) return done(err);
              teacher.id = res.body.profile.id;
              teacher.token = res.body.token;
              return cb();
            });
        }
      ], done);
    });

    it('should delete own account', function (done) {
      async.series([
        function (cb) {
          request.get('/api/users/' + coordinator.id)
            .set('Authorization', coordinator.token)
            .expect(status.OK)
            .end(function (err, res) {
              if (err) return done(err);
              expect(res.body[0].id).to.equal(coordinator.id);
              cb();
            });
        },
        function (cb) {
          request.del('/api/users/' + coordinator.id)
            .set('Authorization', coordinator.token)
            .expect(status.OK, cb);
        },
        function (cb) {
          request.get('/api/users/' + coordinator.id)
            .set('Authorization', generatedUsers.admin.token)
            .expect(status.BAD_REQUEST, cb);
        }
      ], done);
    });

    it('should not delete another users account', function (done) {
      request.del('/api/users/' + coordinator.id)
        .set('Authorization', teacher.token)
        .expect(status.UNAUTHORIZED, done);
    });

    it('should require a token', function (done) {
      request.del('/api/users/' + coordinator.id)
        .expect(status.UNAUTHORIZED, done);
    });

    it('should allow admins to delete accounts', function (done) {
      request.del('/api/users/' + coordinator.id)
        .set('Authorization', generatedUsers.admin.token)
        .expect(status.OK, done);
    });

    it('should fail gracefully if a user isnt found', function (done) {
      request.del('/api/users/walal')
        .set('Authorization', generatedUsers.admin.token)
        .expect(status.BAD_REQUEST, done);
    });

    it('should require an id', function (done) {
      request.del('/api/users')
        .set('Authorization', generatedUsers.admin.token)
        .expect(status.NOT_FOUND, done);
    });
  });

  describe('account approval', function () {
    it('should default new accounts to not approved', function (done) {
      var postData = {
        email: 'test@test.com',
        password: 'helloworld',
        firstname: 'firstname',
        lastname: 'lastname'
      };

      request.post('/api/signup')
        .send(postData)
        .expect(status.CREATED)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body.profile.approved).to.be.false;
          return done();
        });
    });

    it('should not allow approval to be set by creator', function (done) {
      var postData = {
        email: 'test@test.com',
        password: 'helloworld',
        firstname: 'firstname',
        lastname: 'lastname',
        approved: true
      };

      request.post('/api/signup')
        .send(postData)
        .expect(status.CREATED)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body.profile.approved).to.be.false;
          return done();
        });
    });

    it('should allow admins to change an accounts approval status', function (done) {
      var accountId;

      async.series([
        function (cb) {
          var postData = {
            email: 'test@test.com',
            password: 'helloworld',
            firstname: 'firstname',
            lastname: 'lastname'
          };

          request.post('/api/signup')
            .send(postData)
            .expect(status.CREATED)
            .end(function (err, res) {
              if (err) return done(err);
              expect(res.body.profile.approved).to.be.false;
              accountId = res.body.profile.id;
              return cb();
            });
        },
        function (cb) {
          request.put('/api/users/' + accountId)
            .set('Authorization', generatedUsers.admin.token)
            .send({ approved: true })
            .expect(status.OK)
            .end(function (err, res) {
              if (err) return done(err);
              expect(res.body.profile.approved).to.be.true;
              expect(res.body.profile.id).to.equal(accountId);
              return cb();
            });
        }
      ], done);
    });

    it('should not allow coordinators to change account approval status', function (done) {
      var accountId;

      async.series([
        function (cb) {
          var postData = {
            email: 'test@test.com',
            password: 'helloworld',
            firstname: 'firstname',
            lastname: 'lastname'
          };

          request.post('/api/signup')
            .send(postData)
            .expect(status.CREATED)
            .end(function (err, res) {
              if (err) return done(err);
              expect(res.body.profile.approved).to.be.false;
              accountId = res.body.profile.id;
              return cb();
            });
        },
        function (cb) {
          request.put('/api/users/' + accountId)
            .set('Authorization', generatedUsers.coordinator.token)
            .send({ approved: true })
            .expect(status.UNAUTHORIZED, cb);
        }
      ], done);
    });

    it('should not allow teachers to change account approval status', function (done) {
      var accountId;

      async.series([
        function (cb) {
          var postData = {
            email: 'test@test.com',
            password: 'helloworld',
            firstname: 'firstname',
            lastname: 'lastname'
          };

          request.post('/api/signup')
            .send(postData)
            .expect(status.CREATED)
            .end(function (err, res) {
              if (err) return done(err);
              expect(res.body.profile.approved).to.be.false;
              accountId = res.body.profile.id;
              return cb();
            });
        },
        function (cb) {
          request.put('/api/users/' + accountId)
            .set('Authorization', generatedUsers.teacher.token)
            .send({ approved: true })
            .expect(status.UNAUTHORIZED, cb);
        }
      ], done);
    });

    it('should require approval for protected routes', function (done) {
      var token, accountId;
      var exampleScout = {
        firstname: 'Scouty',
        lastname: 'McScoutFace',
        birthday: new Date(1999, 1, 1),
        troop: 101,
        notes: 'Is a boat',
        emergency_name: 'David Attenborough',
        emergency_relation: 'Idol',
        emergency_phone: '1234567890'
      };

      async.series([
        function (cb) {
          var postData = {
            email: 'test@test.com',
            password: 'helloworld',
            firstname: 'firstname',
            lastname: 'lastname',
            role: 'coordinator',
            details: {
              troop: 1,
              district: 'district',
              council: 'council'
            }
          };

          request.post('/api/signup')
            .send(postData)
            .expect(status.CREATED)
            .end(function (err, res) {
              if (err) return done(err);
              expect(res.body.profile.approved).to.be.false;
              accountId = res.body.profile.id;
              token = res.body.token;
              return cb();
            });
        },
        function (cb) {
          request.post('/api/users/' + accountId + '/scouts')
            .set('Authorization', token)
            .send(exampleScout)
            .expect(status.UNAUTHORIZED, cb);
        }
      ], done);
    });

    it('should allow changes once an account is approved', function (done) {
      var token, accountId;
      var exampleScout = {
        firstname: 'Scouty',
        lastname: 'McScoutFace',
        birthday: new Date(1999, 1, 1),
        troop: 101,
        notes: 'Is a boat',
        emergency_name: 'David Attenborough',
        emergency_relation: 'Idol',
        emergency_phone: '1234567890'
      };

      async.series([
        function (cb) {
          var postData = {
            email: 'test@test.com',
            password: 'helloworld',
            firstname: 'firstname',
            lastname: 'lastname',
            role: 'coordinator',
            details: {
              troop: 1,
              district: 'district',
              council: 'council'
            }
          };

          request.post('/api/signup')
            .send(postData)
            .expect(status.CREATED)
            .end(function (err, res) {
              if (err) return done(err);
              expect(res.body.profile.approved).to.be.false;
              accountId = res.body.profile.id;
              token = res.body.token;
              return cb();
            });
        },
        function (cb) {
          request.post('/api/users/' + accountId + '/scouts')
            .set('Authorization', token)
            .send(exampleScout)
            .expect(status.UNAUTHORIZED, cb);
        },
        function (cb) {
          request.put('/api/users/' + accountId)
            .set('Authorization', generatedUsers.admin.token)
            .send({ approved: true })
            .expect(status.OK)
            .end(function (err, res) {
              if (err) return done(err);
              expect(res.body.profile.approved).to.be.true;
              expect(res.body.profile.id).to.equal(accountId);
              return cb();
            });
        },
        function (cb) {
          request.post('/api/users/' + accountId + '/scouts')
            .set('Authorization', token)
            .send(exampleScout)
            .expect(status.CREATED, cb);
        }
      ], done);
    });
  });
});
