import supertest from 'supertest';
import * as async from 'async';
import status from 'http-status-codes';
import { expect } from 'chai';

import app from '@app/app';
import TestUtils from './testUtils';
import { SignupRequestInterface } from '@interfaces/user.interface';

const request = supertest(app);

describe('users', () => {
    beforeEach(async () => {
        await TestUtils.dropDb();
    });

    after(async () => {
        await TestUtils.dropDb();
    });

    describe('user account creation', () => {
        it('creates an account if all required info is supplied', (done) => {
            const postData: SignupRequestInterface = {
                email: 'test@test.com',
                password: 'password',
                firstname: 'firstname',
                lastname: 'lastname'
            };

            request.post('/api/signup')
                .send(postData)
                .expect(status.CREATED, done);
        });

        it('should return a token and the profile', (done) => {
            const postData: SignupRequestInterface = {
                email: 'test@test.com',
                password: 'password',
                firstname: 'firstname',
                lastname: 'lastname'
            };

            request.post('/api/signup')
                .send(postData)
                .expect(status.CREATED)
                .end((err, res) => {
                    if (err) { done(err); }
                    expect(res.body.profile.email).to.equal(postData.email);
                    expect(res.body.profile.firstname).to.equal(postData.firstname);
                    expect(res.body.profile.lastname).to.equal(postData.lastname);
                    expect(res.body.profile.password).to.not.exist;
                    expect(res.body.token).to.exist;
                    done();
                });
        });

        it('requires email, password, firstname, lastname', (done) => {
            let postData: any = {};

            async.series([
             (cb) => {
                    request.post('/api/signup')
                        .send(postData)
                        .expect(status.BAD_REQUEST, cb);
                }, (cb) => {
                    postData = {
                        email: 'test@test.com'
                    };
                    request.post('/api/signup')
                        .send(postData)
                        .expect(status.BAD_REQUEST, cb);
                }, (cb) => {
                    postData = {
                        email: 'test@test.com',
                        password: 'password'
                    };
                    request.post('/api/signup')
                        .send(postData)
                        .expect(status.BAD_REQUEST, cb);
                }, (cb) => {
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

        it('checks for a valid email address', (done) => {
            let postData: SignupRequestInterface;

            async.series([
             (cb) => {
                    postData = {
                        email: 'invalid',
                        password: 'password',
                        firstname: 'firstname',
                        lastname: 'lastname'
                    };
                    request.post('/api/signup')
                        .send(postData)
                        .expect(status.BAD_REQUEST, cb);
                }, (cb) => {
                    postData = {
                        email: 'invalid@wrong',
                        password: 'password',
                        firstname: 'firstname',
                        lastname: 'lastname'
                    };
                    request.post('/api/signup')
                        .send(postData)
                        .expect(status.BAD_REQUEST, cb);
                }, (cb) => {
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

        describe('when a user already exists', () => {
            let postData: SignupRequestInterface;

            beforeEach((done) => {
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

            it('should know if a user exists by email', (done) => {
                request.get('/api/users/exists/Test@test.com')
                    .expect(status.OK)
                    .end((err, res) => {
                        if (err) { done(err); }
                        expect(res.body.exists).to.be.true;
                        done();
                    });
            });

            it('should not create a duplicate user', (done) => {
                request.post('/api/signup')
                    .send(postData)
                    .expect(status.BAD_REQUEST, done);
            });

            it('should treat email as case insensitive', (done) => {
                const uppercaseData: SignupRequestInterface = {
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

    describe('account authentication', () => {
        beforeEach((done) => {
            const postData: SignupRequestInterface = {
                email: 'test@test.com',
                password: 'password',
                firstname: 'firstname',
                lastname: 'lastname'
            };

            request.post('/api/signup')
                .send(postData)
                .expect(status.CREATED, done);
        });

        it('should find a user and send back a token', (done) => {
            request.post('/api/authenticate')
                .send({
                    email: 'test@test.com',
                    password: 'password'
                })
                .expect(status.OK, done);
        });

        it('should not enforce case sensitivity for emails', (done) => {
            request.post('/api/authenticate')
                .send({
                    email: 'Test@Test.com',
                    password: 'password'
                })
                .expect(status.OK, done);
        });

        it('should fail gracefully if no email is supplied', (done) => {
            request.post('/api/authenticate')
                .expect(status.UNAUTHORIZED, done);
        });

        it('should not find a nonexistent email', (done) => {
            request.post('/api/authenticate')
                .send({
                    email: 'dne'
                })
                .expect(status.UNAUTHORIZED, done);
        });

        it('should fail to authenticate without a password', (done) => {
            request.post('/api/authenticate')
                .send({
                    email: 'test@test.com'
                })
                .expect(status.UNAUTHORIZED, done);
        });

        it('should fail to authenticate with an incorrect password', (done) => {
            request.post('/api/authenticate')
                .send({
                    email: 'test@test.com',
                    password: 'pwd'
                })
                .expect(status.UNAUTHORIZED, done);
        });
    });

    describe('getting a profile with token', () => {
        let token: string = null;

        beforeEach((done) => {
            const postData: SignupRequestInterface = {
                email: 'test@test.com',
                password: 'password',
                firstname: 'firstname',
                lastname: 'lastname'
            };

            request.post('/api/signup')
                .send(postData)
                .expect(status.CREATED)
                .end((err, res) => {
                    if (err) { done(err); }
                    token = res.body.token;
                    done();
                });
        });

        it('should reply with the profile for the jwt owner', (done) => {
            request.get('/api/profile')
                .set('Authorization', token)
                .expect(status.OK)
                .end((err, res) => {
                    if (err) { done(err); }
                    expect(res.body.profile.email).to.equal('test@test.com');
                    expect(res.body.profile.firstname).to.equal('firstname');
                    expect(res.body.profile.lastname).to.equal('lastname');
                    expect(res.body.profile.role).to.equal('anonymous');
                    done();
                });
        });
    });
});
