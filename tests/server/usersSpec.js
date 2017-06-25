var app = require('../../src/app');
var request = require('supertest')(app);
var async = require('async');

var chai = require('chai');
var expect = chai.expect;

var status = require('http-status-codes');
var utils = require('./testUtils');

describe.only('users', function () {
  beforeEach(function (done) {
    utils.dropDb(done);
  });

  after(function (done) {
    utils.dropDb(done);
  });

  describe('user account creation', function () {
    this.timeout(5000);

    it('creates an account if all required info is supplied', function (done) {
      var postData = {
        email: 'test@test.com',
        password: 'password',
        firstname: 'firstname',
        lastname: 'lastname'
      };
      request.post('/api/signup')
        .send(postData)
        .expect(status.CREATED, done);
    });

    it('should return a token and the profile', function (done) {
      var postData = {
        email: 'test@test.com',
        password: 'password',
        firstname: 'firstname',
        lastname: 'lastname'
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
          done();
        });
    });

    it('requires email, password, firstname, lastname', function (done) {
      var postData = {};

      async.series([
        function (cb) {
          request.post('/api/signup')
            .send(postData)
            .expect(status.BAD_REQUEST, cb);
        }, function (cb) {
          postData = {
            email: 'test@test.com'
          };
          request.post('/api/signup')
            .send(postData)
            .expect(status.BAD_REQUEST, cb);
        }, function (cb) {
          postData = {
            email: 'test@test.com',
            password: 'password'
          };
          request.post('/api/signup')
            .send(postData)
            .expect(status.BAD_REQUEST, cb);
        }, function (cb) {
          postData = {
            firstname: 'firstname',
            lastname: 'lastname'
          };
          request.post('/api/signup')
            .send(postData)
            .expect(status.BAD_REQUEST, cb);
        }
      ], done);
    });

    it('checks for a valid email address', function (done) {
      var postData;

      async.series([
        function (cb) {
          postData = {
            email: 'invalid',
            password: 'password',
            firstname: 'firstname',
            lastname: 'lastname'
          };
          request.post('/api/signup')
            .send(postData)
            .expect(status.BAD_REQUEST, cb);
        }, function (cb) {
          postData = {
            email: 'invalid@wrong',
            password: 'password',
            firstname: 'firstname',
            lastname: 'lastname'
          };
          request.post('/api/signup')
            .send(postData)
            .expect(status.BAD_REQUEST, cb);
        }, function (cb) {
          postData = {
            email: 'invalid.wrong.com',
            password: 'password',
            firstname: 'firstname',
            lastname: 'lastname'
          };
          request.post('/api/signup')
            .send(postData)
            .expect(status.BAD_REQUEST, cb);
        }
      ], done);
    });

    describe('when a user already exists', function () {
      var postData;

      beforeEach(function (done) {
        postData = {
          email: 'test@test.com',
          password: 'password',
          firstname: 'firstname',
          lastname: 'lastname'
        };

        request.post('/api/signup')
          .send(postData)
          .expect(status.CREATED, done);
      });

      it('should know if a user exists by email', function (done) {
        request.get('/api/users/exists/Test@test.com')
          .expect(status.OK)
          .end(function (err, res) {
            if (err) return done(err);
            expect(res.body.exists).to.be.true;
            done();
          })
      });

      it('should not create a duplicate user', function (done) {
          request.post('/api/signup')
            .send(postData)
            .expect(status.BAD_REQUEST, done);
      });

      it('should treat email as case insensitive', function (done) {
        var uppercaseData = {
          email: 'Test@Test.com',
          password: 'password',
          firstname: 'firstname',
          lastname: 'lastname'
        };

        request.post('/api/signup')
            .send(uppercaseData)
            .expect(status.BAD_REQUEST, done);
      });
    });
  });

  describe('account authentication', function () {
    beforeEach(function (done) {
      var postData = {
        email: 'test@test.com',
        password: 'password',
        firstname: 'firstname',
        lastname: 'lastname'
      };

      request.post('/api/signup')
        .send(postData)
        .expect(status.CREATED, done);
    });

    it('should find a user and send back a token', function (done) {
      request.post('/api/authenticate')
        .send({
          email: 'test@test.com',
          password: 'password'
        })
        .expect(status.OK, done);
    });

    it('should fail gracefully if no email is supplied', function (done) {
      request.post('/api/authenticate')
        .expect(status.UNAUTHORIZED, done);
    });

    it('should not find a nonexistant email', function (done) {
      request.post('/api/authenticate')
        .send({
          email: 'dne'
        })
        .expect(status.UNAUTHORIZED, done);
    });

    it('should fail to authenticate without a password', function (done) {
      request.post('/api/authenticate')
        .send({
          email: 'test@test.com'
        })
        .expect(status.UNAUTHORIZED, done);
    });

    it('should fail to authenticate with an incorrect password', function (done) {
      request.post('/api/authenticate')
        .send({
          email: 'test@test.com',
          password: 'pwd'
        })
        .expect(status.UNAUTHORIZED, done);
    });
  });

  describe('getting a profile with token', function () {
    var token = null;

    beforeEach(function (done) {
      var postData = {
        email: 'test@test.com',
        password: 'password',
        firstname: 'firstname',
        lastname: 'lastname'
      };

      request.post('/api/signup')
        .send(postData)
        .expect(status.CREATED)
        .end(function (err, res) {
          if (err) return done(err);
          token = res.body.token;
          done();
        });
    });

    it('should reply with the profile for the jwt owner', function (done) {
      request.get('/api/profile')
        .set('Authorization', token)
        .expect(status.OK)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body.profile.email).to.equal('test@test.com');
          expect(res.body.profile.firstname).to.equal('firstname');
          expect(res.body.profile.lastname).to.equal('lastname');
          expect(res.body.profile.role).to.equal('anonymous');
          done();
        });
    });
  });
});
