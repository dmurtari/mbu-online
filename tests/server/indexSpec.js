var app = require('../../src/app');
var request = require('supertest')(app);

var status = require('http-status-codes');

describe('index', function () {
  it('responds with OK if found', function (done) {
    request.get('/api')
      .expect(status.OK, done);
  });

  it('responds with 404 if invalid', function (done) {
    request.get('/')
      .expect(status.NOT_FOUND, done);
  });
});
