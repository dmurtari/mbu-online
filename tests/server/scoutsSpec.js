var app = require('../../src/app');
var request = require('supertest')(app);
var async = require('async');
var status = require('http-status-codes');

var chai = require('chai');
var expect = chai.expect;

var utils = require('./testUtils');
var testScouts = require('./testScouts');

describe('scouts', function () {
  var generatedUsers;
  var badId = utils.badId;
  var exampleScout;

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

  beforeEach(function () {
    exampleScout = {
      firstname: 'Scouty',
      lastname: 'McScoutFace',
      birthday: new Date(1999, 1, 1),
      troop: 101,
      notes: 'Is a boat',
      emergency_name: 'David Attenborough',
      emergency_relation: 'Idol',
      emergency_phone: '1234567890'
    };
  });

  afterEach(function (done) {
    utils.removeScoutsForUser(generatedUsers.coordinator, done);
  });

  after(function (done) {
    utils.dropDb(done);
  });

  describe('in order to be associated with users', function () {
    it('should be able to be created', function (done) {
      request.post('/api/users/' + generatedUsers.coordinator.profile.id + '/scouts')
        .set('Authorization', generatedUsers.coordinator.token)
        .send(exampleScout)
        .expect(status.CREATED)
        .end(function (err, res) {
          if (err) return done(err);
          var scout = res.body.scout;
          expect(scout.name).to.equal(exampleScout.name);
          expect(scout.emergency_name).to.contain(exampleScout.emergency_name);
          expect(scout.emergency_relation).to.contain(exampleScout.emergency_relation);
          expect(scout.emergency_phone).to.contain(exampleScout.emergency_phone);
          expect(scout.troop).to.equal(exampleScout.troop);
          expect(scout.notes).to.equal(exampleScout.notes);
          expect(new Date(scout.birthday)).to.deep.equal(exampleScout.birthday);
          return done();
        });
    });

    it('should not be created by a different coordinator', function (done) {
      request.post('/api/users/' + generatedUsers.coordinator.profile.id + '/scouts')
        .set('Authorization', generatedUsers.coordinator2.token)
        .send(exampleScout)
        .expect(status.UNAUTHORIZED, done);
    });

    it('should be able to be created by teachers', function (done) {
      request.post('/api/users/' + generatedUsers.coordinator.profile.id + '/scouts')
        .set('Authorization', generatedUsers.teacher.token)
        .send(exampleScout)
        .expect(status.CREATED, done);
    });

    it('should be able to be created by admins', function (done) {
      request.post('/api/users/' + generatedUsers.coordinator.profile.id + '/scouts')
        .set('Authorization', generatedUsers.admin.token)
        .send(exampleScout)
        .expect(status.CREATED, done);
    });

    it('should require authorization', function (done) {
      request.post('/api/users/' + generatedUsers.coordinator.profile.id + '/scouts')
        .send(exampleScout)
        .expect(status.UNAUTHORIZED, done);
    });

    it('should require valid scouts', function (done) {
      var postData = exampleScout;
      postData.birthday = new Date(4000, 1, 1);

      request.post('/api/users/' + generatedUsers.coordinator.profile.id + '/scouts')
        .set('Authorization', generatedUsers.coordinator.token)
        .send(postData)
        .expect(status.BAD_REQUEST, done);
    });

    it('should not allow scouts to be associated with non-coordinators', function (done) {
      request.post('/api/users/' + generatedUsers.teacher.profile.id + '/scouts')
        .set('Authorization', generatedUsers.teacher.token)
        .send(exampleScout)
        .expect(status.BAD_REQUEST, done);
    });

    it('should not create a scout for an invalid id', function (done) {
      request.post('/api/users/' + badId + '/scouts')
        .set('Authorization', generatedUsers.coordinator.token)
        .send(exampleScout)
        .expect(status.UNAUTHORIZED, done);
    });
  });

  describe('when scouts exist', function () {
    var scoutCount = 5;
    var scouts;

    beforeEach(function (done) {
      utils.removeScoutsForUser(generatedUsers.coordinator, done);
    });

    beforeEach(function (done) {
      utils.createScoutsForUser(generatedUsers.coordinator, testScouts(scoutCount), generatedUsers.coordinator.token,
        function (err, registeredScouts) {
          if (err) return done(err);
          scouts = registeredScouts;
          return done();
        });
    });

    describe('seeing registered scouts', function () {
      it('should be able to get scouts for a user', function (done) {
        request.get('/api/users/' + generatedUsers.coordinator.profile.id + '/scouts')
          .set('Authorization', generatedUsers.coordinator.token)
          .expect(status.OK)
          .end(function (err, res) {
            if (err) return done(err);
            var user = res.body[0];
            expect(user.scouts.length).to.equal(scoutCount);
            return done();
          });
      });

      it('should let admins get scouts for a user', function (done) {
        request.get('/api/users/' + generatedUsers.coordinator.profile.id + '/scouts')
          .set('Authorization', generatedUsers.admin.token)
          .expect(status.OK)
          .end(function (err, res) {
            if (err) return done(err);
            var user = res.body[0];
            expect(user.scouts.length).to.equal(scoutCount);
            return done();
          });
      });

      it('should let teachers get scouts for a user', function (done) {
        request.get('/api/users/' + generatedUsers.coordinator.profile.id + '/scouts')
          .set('Authorization', generatedUsers.teacher.token)
          .expect(status.OK)
          .end(function (err, res) {
            if (err) return done(err);
            var user = res.body[0];
            expect(user.scouts.length).to.equal(scoutCount);
            return done();
          });
      });

      it('should not get scouts if the user doesnt exist', function (done) {
        request.get('/api/users/' + badId + '/scouts')
          .set('Authorization', generatedUsers.admin.token)
          .expect(status.BAD_REQUEST, done);
      });

      it('should not get scouts with an invalid query', function (done) {
        request.get('/api/users?age=250')
          .set('Authorization', generatedUsers.admin.token)
          .expect(status.BAD_REQUEST, done);
      });
    });

    describe('updating registered scouts', function () {
      var scoutUpdate;

      beforeEach(function () {
        scoutUpdate = scouts[0];
      });

      it('should be able to update a scouts information', function (done) {
        scoutUpdate.firstname = 'Updated';
        scoutUpdate.lastname = 'Scout';
        scoutUpdate.emergency_name = 'Incompetent';

        request.put('/api/users/' + generatedUsers.coordinator.profile.id + '/scouts/' + scouts[0].id)
          .set('Authorization', generatedUsers.coordinator.token)
          .send(scoutUpdate)
          .expect(status.OK)
          .end(function (err, res) {
            if (err) return done(err);
            var scout = res.body.scout;
            expect(scout.id).to.equal(scouts[0].id);
            expect(scout.firstname).to.equal('Updated');
            expect(scout.lastname).to.equal('Scout');
            return done();
          });
      });

      it('should allow fields to be deleted', function (done) {
        scoutUpdate.notes = null;
        request.put('/api/users/' + generatedUsers.coordinator.profile.id + '/scouts/' + scouts[0].id)
          .set('Authorization', generatedUsers.coordinator.token)
          .send(scoutUpdate)
          .expect(status.OK)
          .end(function (err, res) {
            if (err) return done(err);
            var scout = res.body.scout;
            expect(scout.notes).to.not.exist;
            return done();
          });
      });

      it('should allow updates from teachers', function (done) {
        request.put('/api/users/' + generatedUsers.coordinator.profile.id + '/scouts/' + scouts[0].id)
          .set('Authorization', generatedUsers.teacher.token)
          .send(scoutUpdate)
          .expect(status.OK, done);
      });

      it('should allow updates from admins', function (done) {
        request.put('/api/users/' + generatedUsers.coordinator.profile.id + '/scouts/' + scouts[0].id)
          .set('Authorization', generatedUsers.admin.token)
          .send(scoutUpdate)
          .expect(status.OK, done);
      });

      it('should not allow update from a different coordinator', function (done) {
        request.put('/api/users/' + generatedUsers.coordinator.profile.id + '/scouts/' + scouts[0].id)
          .set('Authorization', generatedUsers.coordinator2.token)
          .send(scoutUpdate)
          .expect(status.UNAUTHORIZED, done);
      });

      it('should not update with invalid fields', function (done) {
        scoutUpdate.birthday = new Date(4000, 1, 1);
        request.put('/api/users/' + generatedUsers.coordinator.profile.id + '/scouts/' + scouts[0].id)
          .set('Authorization', generatedUsers.coordinator.token)
          .send(scoutUpdate)
          .expect(status.BAD_REQUEST, done);
      });

      it('should not update a nonexistent user', function (done) {
        request.put('/api/users/' + badId + '/scouts/' + scouts[0].id)
          .set('Authorization', generatedUsers.coordinator.token)
          .send(scoutUpdate)
          .expect(status.UNAUTHORIZED, done);
      });

      it('should not update nonexistent scouts', function (done) {
        request.put('/api/users/' + generatedUsers.coordinator.profile.id + '/scouts/' + badId)
          .set('Authorization', generatedUsers.coordinator.token)
          .send(scoutUpdate)
          .expect(status.BAD_REQUEST, done);
      });
    });

    describe('deleting scouts', function () {
      it('should delete scouts for a user', function (done) {
        async.series([
          function (cb) {
            request.get('/api/users/' + generatedUsers.coordinator.profile.id + '/scouts')
              .set('Authorization', generatedUsers.admin.token)
              .expect(status.OK)
              .end(function (err, res) {
                if (err) return done(err);
                expect(res.body[0].scouts).to.have.lengthOf(scoutCount);
                return cb();
              });
          },
          function (cb) {
            request.del('/api/users/' + generatedUsers.coordinator.profile.id + '/scouts/' + scouts[0].id)
              .set('Authorization', generatedUsers.coordinator.token)
              .expect(status.OK, cb);
          },
          function (cb) {
            request.get('/api/users/' + generatedUsers.coordinator.profile.id + '/scouts')
              .set('Authorization', generatedUsers.admin.token)
              .expect(status.OK)
              .end(function (err, res) {
                if (err) return done(err);
                expect(res.body[0].scouts).to.have.lengthOf(scoutCount - 1);
                return cb();
              });
          }
        ], done);
      });

      it('should require authorization', function (done) {
        request.del('/api/users/' + generatedUsers.coordinator.profile.id + '/scouts/' + scouts[0].id)
          .expect(status.UNAUTHORIZED, done);
      });

      it('should check for the correct owner', function (done) {
        request.del('/api/users/' + generatedUsers.coordinator.profile.id + '/scouts/' + scouts[0].id)
          .set('Authorization', generatedUsers.coordinator2.token)
          .expect(status.UNAUTHORIZED, done);
      });

      it('should allow admins to delete', function (done) {
        request.del('/api/users/' + generatedUsers.coordinator.profile.id + '/scouts/' + scouts[0].id)
          .set('Authorization', generatedUsers.admin.token)
          .expect(status.OK, done);
      });

      it('should allow teachers to delete', function (done) {
        request.del('/api/users/' + generatedUsers.coordinator.profile.id + '/scouts/' + scouts[0].id)
          .set('Authorization', generatedUsers.teacher.token)
          .expect(status.OK, done);
      });

      it('should not delete from nonexistent users', function (done) {
        request.del('/api/users/' + badId + '/scouts/' + scouts[0].id)
          .set('Authorization', generatedUsers.coordinator.token)
          .expect(status.UNAUTHORIZED, done);
      });

      it('should not delete nonexistent scouts', function (done) {
        request.del('/api/users/' + generatedUsers.coordinator.profile.id + '/scouts/' + badId)
          .set('Authorization', generatedUsers.coordinator.token)
          .expect(status.BAD_REQUEST, done);
      });
    });
  });
});
