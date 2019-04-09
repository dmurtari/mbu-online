// import supertest from 'supertest';
// import * as async from 'async';
// import status from 'http-status-codes';
// import { expect } from 'chai';

// import app from '@app/app';
// import TestUtils from './testUtils';

// const request = supertest(app);

// describe('user profiles', () => {
//     let generatedUsers;

//     beforeEach((done) => {
//          TestUtils.dropDb(done);
//     });

//     beforeEach((done) => {
//         this.timeout(10000);
//         TestUtils.generateTokens(['admin', 'teacher', 'coordinator'], (err, generatedTokens) => {
//             if (err) return done(err);
//             generatedUsers = generatedTokens;
//             return done();
//         });
//     });

//     after((done) => {
//         TestUtils.dropDb(done);
//     });

//     describe('account details', () => {
//         it('creates an account with coordinator information', (done) => {
//             var postData = {
//                 email: 'test@test.com',
//                 password: 'password',
//                 firstname: 'firstname',
//                 lastname: 'lastname',
//                 role: 'coordinator',
//                 details: {
//                     troop: 1,
//                     district: 'district',
//                     council: 'council'
//                 }
//             };

//             request.post('/api/signup')
//                 .send(postData)
//                 .expect(status.CREATED)
//                 .end((err, res) => {
//                     if (err) return done(err);
//                     expect(res.body.profile.email).to.equal(postData.email);
//                     expect(res.body.profile.firstname).to.equal(postData.firstname);
//                     expect(res.body.profile.lastname).to.equal(postData.lastname);
//                     expect(res.body.profile.password).to.not.exist;
//                     expect(res.body.token).to.exist;
//                     expect(res.body.profile.details).to.deep.equal(postData.details);
//                     return done();
//                 });
//         });

//         it('creates an account with teacher information', (done) => {
//             var postData = {
//                 email: 'test@test.com',
//                 password: 'password',
//                 firstname: 'firstname',
//                 lastname: 'lastname',
//                 role: 'teacher',
//                 details: {
//                     chapter: 'chapter'
//                 }
//             };

//             request.post('/api/signup')
//                 .send(postData)
//                 .expect(status.CREATED)
//                 .end((err, res) => {
//                     if (err) return done(err);
//                     expect(res.body.profile.email).to.equal(postData.email);
//                     expect(res.body.profile.firstname).to.equal(postData.firstname);
//                     expect(res.body.profile.lastname).to.equal(postData.lastname);
//                     expect(res.body.profile.password).to.not.exist;
//                     expect(res.body.token).to.exist;
//                     expect(res.body.profile.details).to.deep.equal(postData.details);
//                     return done();
//                 });
//         });

//         it('does not create coordinator with teacher info', (done) => {
//             var postData = {
//                 email: 'test@test.com',
//                 password: 'password',
//                 firstname: 'firstname',
//                 lastname: 'lastname',
//                 role: 'coordinator',
//                 details: {
//                     chapter: 'chapter'
//                 }
//             };

//             request.post('/api/signup')
//                 .send(postData)
//                 .expect(status.BAD_REQUEST, done);
//         });

//         it('does not create teacher with coordinator info', (done) => {
//             var postData = {
//                 email: 'test@test.com',
//                 password: 'password',
//                 firstname: 'firstname',
//                 lastname: 'lastname',
//                 role: 'teacher',
//                 details: {
//                     troop: 1,
//                     district: 'district',
//                     council: 'council'
//                 }
//             };

//             request.post('/api/signup')
//                 .send(postData)
//                 .expect(status.BAD_REQUEST, done);
//         });
//     });

//     describe('getting account details', () => {
//         var user1, user2;

//         beforeEach((done) => {
//             user1 = {
//                 email: 'test1@test.com',
//                 password: 'password',
//                 firstname: 'firstname',
//                 lastname: 'lastname',
//                 role: 'coordinator',
//                 details: {
//                     troop: 1,
//                     district: 'district',
//                     council: 'council'
//                 }
//             };

//             user2 = {
//                 email: 'test2@test.com',
//                 password: 'password',
//                 firstname: 'firstname',
//                 lastname: 'lastname',
//                 role: 'coordinator',
//                 details: {
//                     troop: 2,
//                     district: 'district2',
//                     council: 'council2'
//                 }
//             };

//             async.series([
//                 (cb) => {
//                     request.post('/api/signup')
//                         .send(user1)
//                         .expect(status.CREATED)
//                         .end((err, res) => {
//                             if (err) return done(err);
//                             user1.id = res.body.profile.id;
//                             user1.token = res.body.token;
//                             return cb();
//                         });
//                 },
//                 (cb) => {
//                     request.post('/api/signup')
//                         .send(user2)
//                         .expect(status.CREATED)
//                         .end((err, res) => {
//                             if (err) return done(err);
//                             user2.id = res.body.profile.id;
//                             user2.token = res.body.token;
//                             return cb();
//                         });
//                 }
//             ], done);
//         });

//         it('should not return the encrypted password', (done) => {
//             request.get('/api/users/' + user1.id)
//                 .set('Authorization', user1.token)
//                 .expect(status.OK)
//                 .end((err, res) => {
//                     if (err) return done(err);
//                     expect(res.body.password).to.not.exist;
//                     return done();
//                 });
//         });

//         it('should get details for a user with their own token', (done) => {
//             request.get('/api/users/' + user1.id)
//                 .set('Authorization', user1.token)
//                 .expect(status.OK)
//                 .end((err, res) => {
//                     if (err) return done(err);
//                     expect(res.body[0].id).to.equal(user1.id);
//                     expect(res.body[0].details).to.deep.equal(user1.details);
//                     return done();
//                 });
//         });

//         it('should get details for a user with an admin token', (done) => {
//             request.get('/api/users/' + user1.id)
//                 .set('Authorization', generatedUsers.admin.token)
//                 .expect(status.OK)
//                 .end((err, res) => {
//                     if (err) return done(err);
//                     expect(res.body[0].id).to.equal(user1.id);
//                     expect(res.body[0].details).to.deep.equal(user1.details);
//                     return done();
//                 });
//         });

//         it('should get details for a user with a teacher token', (done) => {
//             request.get('/api/users/' + user1.id)
//                 .set('Authorization', generatedUsers.teacher.token)
//                 .expect(status.OK)
//                 .end((err, res) => {
//                     if (err) return done(err);
//                     expect(res.body[0].id).to.equal(user1.id);
//                     expect(res.body[0].details).to.deep.equal(user1.details);
//                     return done();
//                 });
//         });

//         it('should not allow other users to see other profiles', (done) => {
//             request.get('/api/users/' + user1.id)
//                 .set('Authorization', user2.token)
//                 .expect(status.UNAUTHORIZED, done);
//         });

//         it('should not allow other users to see other profiles with query', (done) => {
//             request.get('/api/users?id=' + user1.id)
//                 .set('Authorization', user2.token)
//                 .expect(status.UNAUTHORIZED, done);
//         });

//         it('should not get details for an invalid user', (done) => {
//             request.get('/api/users/wat')
//                 .set('Authorization', generatedUsers.admin.token)
//                 .expect(status.BAD_REQUEST, done);
//         });
//     });

//     describe('editing account details', () => {
//         var user1, user2;

//         beforeEach((done) => {
//             user1 = {
//                 email: 'test1@test.com',
//                 password: 'password',
//                 firstname: 'firstname',
//                 lastname: 'lastname',
//                 role: 'coordinator',
//                 details: {
//                     troop: 1,
//                     district: 'district',
//                     council: 'council'
//                 }
//             };

//             user2 = {
//                 email: 'test2@test.com',
//                 password: 'password',
//                 firstname: 'firstname',
//                 lastname: 'lastname',
//                 role: 'teacher',
//                 details: {
//                     chapter: 'Book'
//                 }
//             };

//             async.series([
//                 (cb) => {
//                     request.post('/api/signup')
//                         .send(user1)
//                         .expect(status.CREATED)
//                         .end((err, res) => {
//                             if (err) return done(err);
//                             user1.id = res.body.profile.id;
//                             user1.token = res.body.token;
//                             return cb();
//                         });
//                 },
//                 (cb) => {
//                     request.post('/api/signup')
//                         .send(user2)
//                         .expect(status.CREATED)
//                         .end((err, res) => {
//                             if (err) return done(err);
//                             user2.id = res.body.profile.id;
//                             user2.token = res.body.token;
//                             return cb();
//                         });
//                 }
//             ], done);
//         });

//         it('should edit a profile', (done) => {
//             var edited = {
//                 firstname: 'changed',
//                 details: {
//                     troop: 1000
//                 }
//             };

//             request.put('/api/users/' + user1.id)
//                 .set('Authorization', user1.token)
//                 .send(edited)
//                 .expect(status.OK)
//                 .end((err, res) => {
//                     if (err) return done(err);
//                     expect(res.body.profile.id).to.equal(user1.id);
//                     expect(res.body.profile.firstname).to.equal(edited.firstname);
//                     expect(res.body.profile.lastname).to.equal(user1.lastname);
//                     expect(res.body.profile.details).to.deep.equal(edited.details);
//                     return done();
//                 });
//         });

//         it('should still login after editing a profile', (done) => {
//             async.series([
//                 (cb) => {
//                     request.post('/api/authenticate')
//                         .send({
//                             email: user2.email,
//                             password: user2.password
//                         })
//                         .expect(status.OK, cb);
//                 },
//                 (cb) => {
//                     request.put('/api/users/' + user2.id)
//                         .set('Authorization', user2.token)
//                         .send({ firstname: 'New' })
//                         .expect(status.OK)
//                         .end((err) => {
//                             if (err) return done(err);
//                             cb();
//                         });
//                 },
//                 (cb) => {
//                     request.post('/api/authenticate')
//                         .send({
//                             email: user2.email,
//                             password: user2.password
//                         })
//                         .expect(status.OK, cb);
//                 }
//             ], done);
//         });

//         it('should not send a token if the password did not change', (done) => {
//             request.put('/api/users/' + user1.id)
//                 .set('Authorization', user1.token)
//                 .send({ firstname: 'New' })
//                 .expect(status.OK)
//                 .end((err, res) => {
//                     if (err) return done(err);
//                     expect(res.body.token).to.not.exist;
//                     return done();
//                 });
//         });

//         it('should not allow invalid details', (done) => {
//             request.put('/api/users/' + user2.id)
//                 .set('Authorization', user2.token)
//                 .send({
//                     details: { troop: 450 }
//                 })
//                 .expect(status.BAD_REQUEST, done);
//         });

//         it('should not allow other coordinators to edit a coordinator profile', (done) => {
//             request.put('/api/users/' + user1.id)
//                 .set('Authorization', generatedUsers.coordinator.token)
//                 .expect(status.UNAUTHORIZED, done);
//         });

//         it('should not allow coordinators to edit a teacher profile', (done) => {
//             request.put('/api/users/' + user2.id)
//                 .set('Authorization', user1.token)
//                 .expect(status.UNAUTHORIZED, done);
//         });

//         it('should allow admins to edit a profile', (done) => {
//             request.put('/api/users/' + user1.id)
//                 .set('Authorization', generatedUsers.admin.token)
//                 .expect(status.OK, done);
//         });

//         it('should allow teachers to edit a profile', (done) => {
//             request.put('/api/users/' + user1.id)
//                 .set('Authorization', generatedUsers.teacher.token)
//                 .expect(status.OK, done);
//         });

//         it('should change a password', (done) => {
//             var newToken;
//             var edit = {
//                 password: 'edited'
//             };

//             async.series([
//                 (cb) => {
//                     request.post('/api/authenticate')
//                         .send({
//                             email: user2.email,
//                             password: user2.password
//                         })
//                         .expect(status.OK, cb);
//                 },
//                 (cb) => {
//                     request.put('/api/users/' + user2.id)
//                         .set('Authorization', user2.token)
//                         .send(edit)
//                         .expect(status.OK)
//                         .end((err, res) => {
//                             if (err) return done(err);
//                             newToken = res.body.token;
//                             cb();
//                         });
//                 },
//                 (cb) => {
//                     request.post('/api/authenticate')
//                         .send({
//                             email: user2.email,
//                             password: edit.password
//                         })
//                         .expect(status.OK, cb);
//                 },
//                 (cb) => {
//                     request.get('/api/profile')
//                         .set('Authorization', newToken)
//                         .expect(status.OK)
//                         .end((err, res) => {
//                             if (err) return done(err);
//                             expect(res.body.profile.email).to.equal(user2.email);
//                             expect(res.body.profile.details).to.deep.equal(user2.details);
//                             return cb();
//                         });
//                 }
//             ], done);
//         });

//         it('should allow changes to the same password', (done) => {
//             var newToken;

//             async.series([
//                 (cb) => {
//                     request.post('/api/authenticate')
//                         .send({
//                             email: user2.email,
//                             password: user2.password
//                         })
//                         .expect(status.OK, cb);
//                 },
//                 (cb) => {
//                     request.put('/api/users/' + user2.id)
//                         .set('Authorization', user2.token)
//                         .send({
//                             password: user2.password
//                         })
//                         .expect(status.OK)
//                         .end((err, res) => {
//                             if (err) return done(err);
//                             newToken = res.body.token;
//                             cb();
//                         });
//                 },
//                 (cb) => {
//                     request.post('/api/authenticate')
//                         .send({
//                             email: user2.email,
//                             password: user2.password
//                         })
//                         .expect(status.OK, cb);
//                 },
//                 (cb) => {
//                     request.get('/api/profile')
//                         .set('Authorization', newToken)
//                         .expect(status.OK)
//                         .end((err, res) => {
//                             if (err) return done(err);
//                             expect(res.body.profile.email).to.equal(user2.email);
//                             expect(res.body.profile.details).to.deep.equal(user2.details);
//                             return cb();
//                         });
//                 }
//             ], done);
//         });

//         it('should allow admins to edit a role', (done) => {
//             async.series([
//                 (cb) => {
//                     request.put('/api/users/' + user2.id)
//                         .set('Authorization', generatedUsers.admin.token)
//                         .send({ role: 'admin' })
//                         .expect(status.OK, cb);
//                 },
//                 (cb) => {
//                     request.get('/api/users/' + user2.id)
//                         .set('Authorization', user2.token)
//                         .expect(status.OK)
//                         .end((err, res) => {
//                             if (err) return done(err);
//                             expect(res.body[0].id).to.equal(user2.id);
//                             expect(res.body[0].role).to.equal('admin');
//                             return cb();
//                         });
//                 }
//             ], done);
//         });

//         it('should not allow teachers to edit a role', (done) => {
//             request.put('/api/users/' + user2.id)
//                 .set('Authorization', generatedUsers.teacher.token)
//                 .send({ role: 'admin' })
//                 .expect(status.UNAUTHORIZED, done);
//         });

//         it('should not allow coordinators to edit a role', (done) => {
//             request.put('/api/users/' + user2.id)
//                 .set('Authorization', generatedUsers.coordinator.token)
//                 .send({ role: 'admin' })
//                 .expect(status.UNAUTHORIZED, done);
//         });

//         it('should not allow self role edits', (done) => {
//             request.put('/api/users/' + user2.id)
//                 .set('Authorization', user2.token)
//                 .send({ role: 'admin' })
//                 .expect(status.UNAUTHORIZED, done);
//         });

//         it('should not allow teachers to edit other passwords', (done) => {
//             request.put('/api/users/' + user2.id)
//                 .set('Authorization', generatedUsers.teacher.token)
//                 .send({ password: 'oops' })
//                 .expect(status.UNAUTHORIZED, done);
//         });

//         it('should allow admins to edit a password', (done) => {
//             request.put('/api/users/' + user2.id)
//                 .set('Authorization', generatedUsers.admin.token)
//                 .send({ password: 'oops' })
//                 .expect(status.OK, done);
//         });

//         it('should allow admins to edit a password', (done) => {
//             request.put('/api/users/' + user2.id)
//                 .set('Authorization', generatedUsers.admin.token)
//                 .send({ password: 'new' })
//                 .expect(status.OK)
//                 .end((err, res) => {
//                     if (err) return done(err);
//                     expect(res.body.token).to.exist;
//                     done();
//                 });
//         });
//     });

//     describe('deleting accounts', () => {
//         var coordinator, teacher;

//         beforeEach((done) => {
//             coordinator = {
//                 email: 'test1@test.com',
//                 password: 'password',
//                 firstname: 'firstname',
//                 lastname: 'lastname',
//                 role: 'coordinator',
//                 details: {
//                     troop: 1,
//                     district: 'district',
//                     council: 'council'
//                 }
//             };

//             teacher = {
//                 email: 'test2@test.com',
//                 password: 'password',
//                 firstname: 'firstname',
//                 lastname: 'lastname',
//                 role: 'teacher',
//                 details: {
//                     chapter: 'Book'
//                 }
//             };

//             async.series([
//                 (cb) => {
//                     request.post('/api/signup')
//                         .send(coordinator)
//                         .expect(status.CREATED)
//                         .end((err, res) => {
//                             if (err) return done(err);
//                             coordinator.id = res.body.profile.id;
//                             coordinator.token = res.body.token;
//                             return cb();
//                         });
//                 },
//                 (cb) => {
//                     request.post('/api/signup')
//                         .send(teacher)
//                         .expect(status.CREATED)
//                         .end((err, res) => {
//                             if (err) return done(err);
//                             teacher.id = res.body.profile.id;
//                             teacher.token = res.body.token;
//                             return cb();
//                         });
//                 }
//             ], done);
//         });

//         it('should delete own account', (done) => {
//             async.series([
//                 (cb) => {
//                     request.get('/api/users/' + coordinator.id)
//                         .set('Authorization', coordinator.token)
//                         .expect(status.OK)
//                         .end((err, res) => {
//                             if (err) return done(err);
//                             expect(res.body[0].id).to.equal(coordinator.id);
//                             cb();
//                         });
//                 },
//                 (cb) => {
//                     request.del('/api/users/' + coordinator.id)
//                         .set('Authorization', coordinator.token)
//                         .expect(status.OK, cb);
//                 },
//                 (cb) => {
//                     request.get('/api/users/' + coordinator.id)
//                         .set('Authorization', generatedUsers.admin.token)
//                         .expect(status.BAD_REQUEST, cb);
//                 }
//             ], done);
//         });

//         it('should not delete another users account', (done) => {
//             request.del('/api/users/' + coordinator.id)
//                 .set('Authorization', teacher.token)
//                 .expect(status.UNAUTHORIZED, done);
//         });

//         it('should require a token', (done) => {
//             request.del('/api/users/' + coordinator.id)
//                 .expect(status.UNAUTHORIZED, done);
//         });

//         it('should allow admins to delete accounts', (done) => {
//             request.del('/api/users/' + coordinator.id)
//                 .set('Authorization', generatedUsers.admin.token)
//                 .expect(status.OK, done);
//         });

//         it('should fail gracefully if a user isnt found', (done) => {
//             request.del('/api/users/walal')
//                 .set('Authorization', generatedUsers.admin.token)
//                 .expect(status.BAD_REQUEST, done);
//         });

//         it('should require an id', (done) => {
//             request.del('/api/users')
//                 .set('Authorization', generatedUsers.admin.token)
//                 .expect(status.NOT_FOUND, done);
//         });
//     });

//     describe('account approval', () => {
//         it('should default new accounts to not approved', (done) => {
//             var postData = {
//                 email: 'test@test.com',
//                 password: 'helloworld',
//                 firstname: 'firstname',
//                 lastname: 'lastname'
//             };

//             request.post('/api/signup')
//                 .send(postData)
//                 .expect(status.CREATED)
//                 .end((err, res) => {
//                     if (err) return done(err);
//                     expect(res.body.profile.approved).to.be.false;
//                     return done();
//                 });
//         });

//         it('should not allow approval to be set by creator', (done) => {
//             var postData = {
//                 email: 'test@test.com',
//                 password: 'helloworld',
//                 firstname: 'firstname',
//                 lastname: 'lastname',
//                 approved: true
//             };

//             request.post('/api/signup')
//                 .send(postData)
//                 .expect(status.CREATED)
//                 .end((err, res) => {
//                     if (err) return done(err);
//                     expect(res.body.profile.approved).to.be.false;
//                     return done();
//                 });
//         });

//         it('should allow admins to change an accounts approval status', (done) => {
//             var accountId;

//             async.series([
//                 (cb) => {
//                     var postData = {
//                         email: 'test@test.com',
//                         password: 'helloworld',
//                         firstname: 'firstname',
//                         lastname: 'lastname'
//                     };

//                     request.post('/api/signup')
//                         .send(postData)
//                         .expect(status.CREATED)
//                         .end((err, res) => {
//                             if (err) return done(err);
//                             expect(res.body.profile.approved).to.be.false;
//                             accountId = res.body.profile.id;
//                             return cb();
//                         });
//                 },
//                 (cb) => {
//                     request.put('/api/users/' + accountId)
//                         .set('Authorization', generatedUsers.admin.token)
//                         .send({ approved: true })
//                         .expect(status.OK)
//                         .end((err, res) => {
//                             if (err) return done(err);
//                             expect(res.body.profile.approved).to.be.true;
//                             expect(res.body.profile.id).to.equal(accountId);
//                             return cb();
//                         });
//                 }
//             ], done);
//         });

//         it('should not allow coordinators to change account approval status', (done) => {
//             var accountId;

//             async.series([
//                 (cb) => {
//                     var postData = {
//                         email: 'test@test.com',
//                         password: 'helloworld',
//                         firstname: 'firstname',
//                         lastname: 'lastname'
//                     };

//                     request.post('/api/signup')
//                         .send(postData)
//                         .expect(status.CREATED)
//                         .end((err, res) => {
//                             if (err) return done(err);
//                             expect(res.body.profile.approved).to.be.false;
//                             accountId = res.body.profile.id;
//                             return cb();
//                         });
//                 },
//                 (cb) => {
//                     request.put('/api/users/' + accountId)
//                         .set('Authorization', generatedUsers.coordinator.token)
//                         .send({ approved: true })
//                         .expect(status.UNAUTHORIZED, cb);
//                 }
//             ], done);
//         });

//         it('should not allow teachers to change account approval status', (done) => {
//             var accountId;

//             async.series([
//                 (cb) => {
//                     var postData = {
//                         email: 'test@test.com',
//                         password: 'helloworld',
//                         firstname: 'firstname',
//                         lastname: 'lastname'
//                     };

//                     request.post('/api/signup')
//                         .send(postData)
//                         .expect(status.CREATED)
//                         .end((err, res) => {
//                             if (err) return done(err);
//                             expect(res.body.profile.approved).to.be.false;
//                             accountId = res.body.profile.id;
//                             return cb();
//                         });
//                 },
//                 (cb) => {
//                     request.put('/api/users/' + accountId)
//                         .set('Authorization', generatedUsers.teacher.token)
//                         .send({ approved: true })
//                         .expect(status.UNAUTHORIZED, cb);
//                 }
//             ], done);
//         });

//         it('should require approval for protected routes', (done) => {
//             var token, accountId;
//             var exampleScout = {
//                 firstname: 'Scouty',
//                 lastname: 'McScoutFace',
//                 birthday: new Date(1999, 1, 1),
//                 troop: 101,
//                 notes: 'Is a boat',
//                 emergency_name: 'David Attenborough',
//                 emergency_relation: 'Idol',
//                 emergency_phone: '1234567890'
//             };

//             async.series([
//                 (cb) => {
//                     var postData = {
//                         email: 'test@test.com',
//                         password: 'helloworld',
//                         firstname: 'firstname',
//                         lastname: 'lastname',
//                         role: 'coordinator',
//                         details: {
//                             troop: 1,
//                             district: 'district',
//                             council: 'council'
//                         }
//                     };

//                     request.post('/api/signup')
//                         .send(postData)
//                         .expect(status.CREATED)
//                         .end((err, res) => {
//                             if (err) return done(err);
//                             expect(res.body.profile.approved).to.be.false;
//                             accountId = res.body.profile.id;
//                             token = res.body.token;
//                             return cb();
//                         });
//                 },
//                 (cb) => {
//                     request.post('/api/users/' + accountId + '/scouts')
//                         .set('Authorization', token)
//                         .send(exampleScout)
//                         .expect(status.UNAUTHORIZED, cb);
//                 }
//             ], done);
//         });

//         it('should allow changes once an account is approved', (done) => {
//             var token, accountId;
//             var exampleScout = {
//                 firstname: 'Scouty',
//                 lastname: 'McScoutFace',
//                 birthday: new Date(1999, 1, 1),
//                 troop: 101,
//                 notes: 'Is a boat',
//                 emergency_name: 'David Attenborough',
//                 emergency_relation: 'Idol',
//                 emergency_phone: '1234567890'
//             };

//             async.series([
//                 (cb) => {
//                     var postData = {
//                         email: 'test@test.com',
//                         password: 'helloworld',
//                         firstname: 'firstname',
//                         lastname: 'lastname',
//                         role: 'coordinator',
//                         details: {
//                             troop: 1,
//                             district: 'district',
//                             council: 'council'
//                         }
//                     };

//                     request.post('/api/signup')
//                         .send(postData)
//                         .expect(status.CREATED)
//                         .end((err, res) => {
//                             if (err) return done(err);
//                             expect(res.body.profile.approved).to.be.false;
//                             accountId = res.body.profile.id;
//                             token = res.body.token;
//                             return cb();
//                         });
//                 },
//                 (cb) => {
//                     request.post('/api/users/' + accountId + '/scouts')
//                         .set('Authorization', token)
//                         .send(exampleScout)
//                         .expect(status.UNAUTHORIZED, cb);
//                 },
//                 (cb) => {
//                     request.put('/api/users/' + accountId)
//                         .set('Authorization', generatedUsers.admin.token)
//                         .send({ approved: true })
//                         .expect(status.OK)
//                         .end((err, res) => {
//                             if (err) return done(err);
//                             expect(res.body.profile.approved).to.be.true;
//                             expect(res.body.profile.id).to.equal(accountId);
//                             return cb();
//                         });
//                 },
//                 (cb) => {
//                     request.post('/api/users/' + accountId + '/scouts')
//                         .set('Authorization', token)
//                         .send(exampleScout)
//                         .expect(status.CREATED, cb);
//                 }
//             ], done);
//         });
//     });
// });
