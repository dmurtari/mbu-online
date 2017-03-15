/* eslint-env mocha */

var expect = require('chai').expect;
var sinon = require('sinon');
var chai = require('chai');
var sinonChai = require('sinon-chai');

var status = require('http-status-codes');

chai.use(sinonChai);

var userRoutes = require('./postUsers');

describe('POST users', function() {
  var req, res;

  beforeEach(function() {
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub()
    };
  });

  describe('POST signup', function() {
    it('should require both email and password', function() {
      req = {
        body: {}
      };
      userRoutes.signup(req, res);
      expect(res.status).to.have.been.calledWith(status.BAD_REQUEST);

      req = {
        body: {
          email: 'blah@blah.com'
        }
      };

      userRoutes.signup(req, res);
      expect(res.status).to.have.been.calledWith(status.BAD_REQUEST);

      req = {
        body: {
          password: 'password'
        }
      };

      userRoutes.signup(req, res);
      expect(res.status).to.have.been.calledWith(status.BAD_REQUEST);
    });
  });
});
