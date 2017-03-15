/* eslint-env mocha */

var expect = require('chai').expect;
var sinon = require('sinon');
var chai = require('chai');
var sinonChai = require('sinon-chai');
var status = require('http-status-codes');

chai.use(sinonChai);

var index = require('./getIndex');

describe('GET index', function() {
  var req, res = null;

  beforeEach(function() {
    req = {};
    res = {
      status: sinon.stub().returnsThis(),
      send: sinon.stub()
    };
  });

  it('should send a welcome message', function(done) {
    index(req, res);
    expect(res.send).to.have.been.calledWith('Welcome to the MBU API');
    done();
  });

  it('should return status OK', function(done) {
    index(req, res);
    expect(res.status).to.have.been.calledWith(status.OK);
    done();
  });
});
