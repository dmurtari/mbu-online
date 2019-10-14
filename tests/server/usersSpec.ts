import supertest from 'supertest';
import * as async from 'async';
import status from 'http-status-codes';
import { expect } from 'chai';

import app from '@app/app';
import TestUtils from './testUtils';
import {
    SignupRequestDto,
    UserTokenResponseDto,
    UserExistsResponseDto,
    LoginRequestDto,
    UserProfileResponseDto
} from '@interfaces/user.interface';
import { SuperTestResponse } from '@test/helpers/supertest.interface';

const request = supertest(app);

describe('users', () => {
    beforeEach(async () => {
        await TestUtils.dropDb();
    });

    afterAll(async () => {
        await TestUtils.dropDb();
        await TestUtils.closeDb();
    });

    describe('user account creation', () => {
        test('creates an account if all required info is supplied', (done) => {
            const postData: SignupRequestDto = {
                email: 'test@test.com',
                password: 'password',
                firstname: 'firstname',
                lastname: 'lastname'
            };

            request.post('/api/signup')
                .send(postData)
                .expect(status.CREATED, done);
        });

        test('should return a token and the profile', (done) => {
            const postData: SignupRequestDto = {
                email: 'test@test.com',
                password: 'password',
                firstname: 'firstname',
                lastname: 'lastname'
            };

            request.post('/api/signup')
                .send(postData)
                .expect(status.CREATED)
                .end((err, res: SuperTestResponse<UserTokenResponseDto>) => {
                    if (err) { done(err); }
                    expect(res.body.profile.email).to.equal(postData.email);
                    expect(res.body.profile.firstname).to.equal(postData.firstname);
                    expect(res.body.profile.lastname).to.equal(postData.lastname);
                    expect(res.body.profile.password).to.not.exist;
                    expect(res.body.token).to.exist;
                    done();
                });
        });

        test('requires email, password, firstname, lastname', (done) => {
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

        test('checks for a valid email address', (done) => {
            let postData: SignupRequestDto;

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
            let postData: SignupRequestDto;

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

            test('should know if a user exists by email', (done) => {
                request.get('/api/users/exists/Test@test.com')
                    .expect(status.OK)
                    .end((err, res: SuperTestResponse<UserExistsResponseDto>) => {
                        if (err) { done(err); }
                        expect(res.body.exists).to.be.true;
                        done();
                    });
            });

            test('should not create a duplicate user', (done) => {
                request.post('/api/signup')
                    .send(postData)
                    .expect(status.BAD_REQUEST, done);
            });

            test('should treat email as case insensitive', (done) => {
                const uppercaseData: SignupRequestDto = {
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
            const postData: SignupRequestDto = {
                email: 'test@test.com',
                password: 'password',
                firstname: 'firstname',
                lastname: 'lastname'
            };

            request.post('/api/signup')
                .send(postData)
                .expect(status.CREATED, done);
        });

        test('should find a user and send back a token', (done) => {
            request.post('/api/authenticate')
                .send(<LoginRequestDto>{
                    email: 'test@test.com',
                    password: 'password'
                })
                .expect(status.OK, done);
        });

        test('should not enforce case sensitivity for emails', (done) => {
            request.post('/api/authenticate')
                .send(<LoginRequestDto>{
                    email: 'Test@Test.com',
                    password: 'password'
                })
                .expect(status.OK, done);
        });

        test('should fail gracefully if no email is supplied', (done) => {
            request.post('/api/authenticate')
                .expect(status.UNAUTHORIZED, done);
        });

        test('should not find a nonexistent email', (done) => {
            request.post('/api/authenticate')
                .send(<LoginRequestDto>{
                    email: 'dne',
                    password: 'test'
                })
                .expect(status.UNAUTHORIZED, done);
        });

        test('should fail to authenticate without a password', (done) => {
            request.post('/api/authenticate')
                .send(<LoginRequestDto>{
                    email: 'test@test.com'
                })
                .expect(status.UNAUTHORIZED, done);
        });

        test('should fail to authenticate with an incorrect password', (done) => {
            request.post('/api/authenticate')
                .send(<LoginRequestDto>{
                    email: 'test@test.com',
                    password: 'pwd'
                })
                .expect(status.UNAUTHORIZED, done);
        });
    });

    describe('getting a profile with token', () => {
        let token: string = null;

        beforeEach((done) => {
            const postData: SignupRequestDto = {
                email: 'test@test.com',
                password: 'password',
                firstname: 'firstname',
                lastname: 'lastname'
            };

            request.post('/api/signup')
                .send(postData)
                .expect(status.CREATED)
                .end((err, res: SuperTestResponse<UserTokenResponseDto>) => {
                    if (err) { done(err); }
                    token = res.body.token;
                    done();
                });
        });

        test('should reply with the profile for the jwt owner', (done) => {
            request.get('/api/profile')
                .set('Authorization', token)
                .expect(status.OK)
                .end((err, res: SuperTestResponse<UserProfileResponseDto>) => {
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
