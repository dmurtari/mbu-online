var app = require('../../src/app');
var request = require('supertest')(app);
var status = require('http-status-codes');

var chai = require('chai');
var expect = chai.expect;

var utils = require('./testUtils');

describe('authentication', function() {
  beforeEach(function(done) {
    utils.dropDb(done);
  });

  after(function(done) {
    utils.dropDb(done);
  });

  describe('user roles', function() {
    it('should create a user with a default role', function(done) {
      var postData = {
        email: 'test@test.com',
        password: 'password',
        firstname: 'firstname',
        lastname: 'lastname'
      };

      request.post('/api/signup')
        .send(postData)
        .expect(status.CREATED)
        .end(function(err, res) {
          if (err) return done(err);
          var user = res.body.profile;
          expect(user.email).to.equal(postData.email);
          expect(user.role).to.equal('anonymous');
          return done();
        });
    });

    it('should create a user with a role', function(done) {
      var postData = {
        email: 'test@test.com',
        password: 'password',
        firstname: 'firstname',
        lastname: 'lastname',
        role: 'coordinator'
      };

      request.post('/api/signup')
        .send(postData)
        .expect(status.CREATED)
        .end(function(err, res) {
          if (err) return done(err);
          var user = res.body.profile;
          expect(user.email).to.equal(postData.email);
          expect(user.role).to.equal(postData.role);
          return done();
        });
    });

    it('should not create a user with an invalid role', function(done) {
      var postData = {
        email: 'test@test.com',
        password: 'password',
        firstname: 'firstname',
        lastname: 'lastname',
        role: 'superuser'
      };

      request.post('/api/signup')
        .send(postData)
        .expect(status.BAD_REQUEST, done);
    });
  });
});
