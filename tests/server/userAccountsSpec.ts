import supertest from 'supertest';
import * as async from 'async';
import status from 'http-status-codes';
import { expect } from 'chai';

import app from '@app/app';
import TestUtils, { RoleTokenObjects } from './testUtils';
import {
    SignupRequestDto,
    UserInterface,
    EditUserDto,
    UserRole,
    UserTokenResponseDto,
    UsersResponseDto,
    EditUserResponseDto,
    LoginRequestDto,
    UserProfileResponseDto
} from '@interfaces/user.interface';
import { ScoutInterface } from '@interfaces/scout.interface';
import { SuperTestResponse } from '@test/helpers/supertest.interface';

const request = supertest(app);

describe('user profiles', () => {
    let generatedUsers: RoleTokenObjects;

    beforeEach(async () => {
        await TestUtils.dropDb();
    });

    beforeEach(async () => {
        generatedUsers = await TestUtils.generateTokens();
    });

    after(async () => {
        await TestUtils.dropDb();
    });

    describe('account details', () => {
        it('creates an account with coordinator information', (done) => {
            const postData: SignupRequestDto = {
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
                .end((err, res: SuperTestResponse<UserTokenResponseDto>) => {
                    if (err) { return done(err); }
                    expect(res.body.profile.email).to.equal(postData.email);
                    expect(res.body.profile.firstname).to.equal(postData.firstname);
                    expect(res.body.profile.lastname).to.equal(postData.lastname);
                    expect(res.body.profile.password).to.not.exist;
                    expect(res.body.token).to.exist;
                    expect(res.body.profile.details).to.deep.equal(postData.details);
                    return done();
                });
        });

        it('creates an account with teacher information', (done) => {
            const postData: SignupRequestDto = {
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
                .end((err, res: SuperTestResponse<UserTokenResponseDto>) => {
                    if (err) { return done(err); }
                    expect(res.body.profile.email).to.equal(postData.email);
                    expect(res.body.profile.firstname).to.equal(postData.firstname);
                    expect(res.body.profile.lastname).to.equal(postData.lastname);
                    expect(res.body.profile.password).to.not.exist;
                    expect(res.body.token).to.exist;
                    expect(res.body.profile.details).to.deep.equal(postData.details);
                    return done();
                });
        });

        it('does not create coordinator with teacher info', (done) => {
            const postData: SignupRequestDto = {
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

        it('does not create teacher with coordinator info', (done) => {
            const postData: SignupRequestDto = {
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

    describe('getting account details', () => {
        let user1: UserInterface;
        let user2: UserInterface;
        let user1Token: string;
        let user2Token: string;

        beforeEach((done) => {
            user1 = {
                email: 'test1@test.com',
                password: 'password',
                firstname: 'firstname',
                lastname: 'lastname',
                role: UserRole.COORDINATOR,
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
                role: UserRole.COORDINATOR,
                details: {
                    troop: 2,
                    district: 'district2',
                    council: 'council2'
                }
            };

            async.series([
                (cb) => {
                    request.post('/api/signup')
                        .send(user1)
                        .expect(status.CREATED)
                        .end((err, res: SuperTestResponse<UserTokenResponseDto>) => {
                            if (err) { return done(err); }
                            user1.id = res.body.profile.id;
                            user1Token = res.body.token;
                            return cb();
                        });
                },
                (cb) => {
                    request.post('/api/signup')
                        .send(user2)
                        .expect(status.CREATED)
                        .end((err, res: SuperTestResponse<UserTokenResponseDto>) => {
                            if (err) { return done(err); }
                            user2.id = res.body.profile.id;
                            user2Token = res.body.token;
                            return cb();
                        });
                }
            ], done);
        });

        it('should not return the encrypted password', (done) => {
            request.get('/api/users/' + user1.id)
                .set('Authorization', user1Token)
                .expect(status.OK)
                .end((err, res) => {
                    if (err) { return done(err); }
                    expect(res.body.password).to.not.exist;
                    return done();
                });
        });

        it('should get details for a user with their own token', (done) => {
            request.get('/api/users/' + user1.id)
                .set('Authorization', user1Token)
                .expect(status.OK)
                .end((err, res: SuperTestResponse<UsersResponseDto>) => {
                    if (err) { return done(err); }
                    expect(res.body[0].id).to.equal(user1.id);
                    expect(res.body[0].details).to.deep.equal(user1.details);
                    return done();
                });
        });

        it('should get details for a user with an admin token', (done) => {
            request.get('/api/users/' + user1.id)
                .set('Authorization', generatedUsers.admin.token)
                .expect(status.OK)
                .end((err, res:  SuperTestResponse<UsersResponseDto>) => {
                    if (err) { return done(err); }
                    expect(res.body[0].id).to.equal(user1.id);
                    expect(res.body[0].details).to.deep.equal(user1.details);
                    return done();
                });
        });

        it('should get a list of users', (done) => {
            request.get('/api/users/')
                .set('Authorization', generatedUsers.admin.token)
                .expect(status.OK)
                .end((err, res: SuperTestResponse<UsersResponseDto>) => {
                    if (err) { return done(err); }
                    expect(res.body).to.have.length(5);
                    return done();
                });
        });

        it('should get details for a user with a teacher token', (done) => {
            request.get('/api/users/' + user1.id)
                .set('Authorization', generatedUsers.teacher.token)
                .expect(status.OK)
                .end((err, res:  SuperTestResponse<UsersResponseDto>) => {
                    if (err) { return done(err); }
                    expect(res.body[0].id).to.equal(user1.id);
                    expect(res.body[0].details).to.deep.equal(user1.details);
                    return done();
                });
        });

        it('should not allow other users to see other profiles', (done) => {
            request.get('/api/users/' + user1.id)
                .set('Authorization', user2Token)
                .expect(status.UNAUTHORIZED, done);
        });

        it('should not allow other users to see other profiles with query', (done) => {
            request.get('/api/users?id=' + user1.id)
                .set('Authorization', user2Token)
                .expect(status.UNAUTHORIZED, done);
        });

        it('should not get details for an invalid user', (done) => {
            request.get('/api/users/wat')
                .set('Authorization', generatedUsers.admin.token)
                .expect(status.BAD_REQUEST, done);
        });
    });

    describe('editing account details', () => {
        let user1: UserInterface;
        let user2: UserInterface;
        let user1Token: string;
        let user2Token: string;

        beforeEach((done) => {
            user1 = {
                email: 'test1@test.com',
                password: 'password',
                firstname: 'firstname',
                lastname: 'lastname',
                role: UserRole.COORDINATOR,
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
                role: UserRole.TEACHER,
                details: {
                    chapter: 'Book'
                }
            };

            async.series([
                (cb) => {
                    request.post('/api/signup')
                        .send(user1)
                        .expect(status.CREATED)
                        .end((err, res: SuperTestResponse<UserTokenResponseDto>) => {
                            if (err) { return done(err); }
                            user1.id = res.body.profile.id;
                            user1Token = res.body.token;
                            return cb();
                        });
                },
                (cb) => {
                    request.post('/api/signup')
                        .send(user2)
                        .expect(status.CREATED)
                        .end((err, res: SuperTestResponse<UserTokenResponseDto>) => {
                            if (err) { return done(err); }
                            user2.id = res.body.profile.id;
                            user2Token = res.body.token;
                            return cb();
                        });
                }
            ], done);
        });

        it('should edit a profile', (done) => {
            const edited: EditUserDto = {
                firstname: 'changed',
                details: {
                    troop: 1000
                }
            };

            request.put('/api/users/' + user1.id)
                .set('Authorization', user1Token)
                .send(edited)
                .expect(status.OK)
                .end((err, res: SuperTestResponse<EditUserResponseDto>) => {
                    if (err) { return done(err); }
                    expect(res.body.profile.id).to.equal(user1.id);
                    expect(res.body.profile.firstname).to.equal(edited.firstname);
                    expect(res.body.profile.lastname).to.equal(user1.lastname);
                    expect(res.body.profile.details).to.deep.equal(edited.details);
                    return done();
                });
        });

        it('should still login after editing a profile', (done) => {
            async.series([
                (cb) => {
                    request.post('/api/authenticate')
                        .send(<LoginRequestDto>{
                            email: user2.email,
                            password: user2.password
                        })
                        .expect(status.OK, cb);
                },
                (cb) => {
                    request.put('/api/users/' + user2.id)
                        .set('Authorization', user2Token)
                        .send(<EditUserDto>{ firstname: 'New' })
                        .expect(status.OK)
                        .end((err) => {
                            if (err) { return done(err); }
                            cb();
                        });
                },
                (cb) => {
                    request.post('/api/authenticate')
                        .send(<LoginRequestDto>{
                            email: user2.email,
                            password: user2.password
                        })
                        .expect(status.OK, cb);
                }
            ], done);
        });

        it('should not send a token if the password did not change', (done) => {
            request.put('/api/users/' + user1.id)
                .set('Authorization', user1Token)
                .send(<EditUserDto>{ firstname: 'New' })
                .expect(status.OK)
                .end((err, res) => {
                    if (err) { return done(err); }
                    expect(res.body.token).to.not.exist;
                    return done();
                });
        });

        it('should not allow invalid details', (done) => {
            request.put('/api/users/' + user2.id)
                .set('Authorization', user2Token)
                .send(<EditUserDto>{
                    details: { troop: 450 }
                })
                .expect(status.BAD_REQUEST, done);
        });

        it('should not allow other coordinators to edit a coordinator profile', (done) => {
            request.put('/api/users/' + user1.id)
                .set('Authorization', generatedUsers.coordinator.token)
                .expect(status.UNAUTHORIZED, done);
        });

        it('should not allow coordinators to edit a teacher profile', (done) => {
            request.put('/api/users/' + user2.id)
                .set('Authorization', user1Token)
                .expect(status.UNAUTHORIZED, done);
        });

        it('should allow admins to edit a profile', (done) => {
            request.put('/api/users/' + user1.id)
                .set('Authorization', generatedUsers.admin.token)
                .expect(status.OK, done);
        });

        it('should allow teachers to edit a profile', (done) => {
            request.put('/api/users/' + user1.id)
                .set('Authorization', generatedUsers.teacher.token)
                .expect(status.OK, done);
        });

        it('should change a password', (done) => {
            let newToken: string;
            const edit: EditUserDto = {
                password: 'edited'
            };

            async.series([
                (cb) => {
                    request.post('/api/authenticate')
                        .send(<LoginRequestDto>{
                            email: user2.email,
                            password: user2.password
                        })
                        .expect(status.OK, cb);
                },
                (cb) => {
                    request.put('/api/users/' + user2.id)
                        .set('Authorization', user2Token)
                        .send(edit)
                        .expect(status.OK)
                        .end((err, res: SuperTestResponse<EditUserResponseDto>) => {
                            if (err) { return done(err); }
                            newToken = res.body.token;
                            cb();
                        });
                },
                (cb) => {
                    request.post('/api/authenticate')
                        .send(<LoginRequestDto>{
                            email: user2.email,
                            password: edit.password
                        })
                        .expect(status.OK, cb);
                },
                (cb) => {
                    request.get('/api/profile')
                        .set('Authorization', newToken)
                        .expect(status.OK)
                        .end((err, res: SuperTestResponse<UserProfileResponseDto>) => {
                            if (err) { return done(err); }
                            expect(res.body.profile.email).to.equal(user2.email);
                            expect(res.body.profile.details).to.deep.equal(user2.details);
                            return cb();
                        });
                }
            ], done);
        });

        it('should allow changes to the same password', (done) => {
            let newToken: string;

            async.series([
                (cb) => {
                    request.post('/api/authenticate')
                        .send(<LoginRequestDto>{
                            email: user2.email,
                            password: user2.password
                        })
                        .expect(status.OK, cb);
                },
                (cb) => {
                    request.put('/api/users/' + user2.id)
                        .set('Authorization', user2Token)
                        .send(<EditUserDto>{
                            password: user2.password
                        })
                        .expect(status.OK)
                        .end((err, res) => {
                            if (err) { return done(err); }
                            newToken = res.body.token;
                            cb();
                        });
                },
                (cb) => {
                    request.post('/api/authenticate')
                        .send(<LoginRequestDto>{
                            email: user2.email,
                            password: user2.password
                        })
                        .expect(status.OK, cb);
                },
                (cb) => {
                    request.get('/api/profile')
                        .set('Authorization', newToken)
                        .expect(status.OK)
                        .end((err, res: SuperTestResponse<UserProfileResponseDto>) => {
                            if (err) { return done(err); }
                            expect(res.body.profile.email).to.equal(user2.email);
                            expect(res.body.profile.details).to.deep.equal(user2.details);
                            return cb();
                        });
                }
            ], done);
        });

        it('should allow admins to edit a role', (done) => {
            async.series([
                (cb) => {
                    request.put('/api/users/' + user2.id)
                        .set('Authorization', generatedUsers.admin.token)
                        .send(<EditUserDto>{ role: 'admin' })
                        .expect(status.OK, cb);
                },
                (cb) => {
                    request.get('/api/users/' + user2.id)
                        .set('Authorization', user2Token)
                        .expect(status.OK)
                        .end((err, res: SuperTestResponse<UsersResponseDto>) => {
                            if (err) { return done(err); }
                            expect(res.body[0].id).to.equal(user2.id);
                            expect(res.body[0].role).to.equal('admin');
                            return cb();
                        });
                }
            ], done);
        });

        it('should not allow teachers to edit a role', (done) => {
            request.put('/api/users/' + user2.id)
                .set('Authorization', generatedUsers.teacher.token)
                .send(<EditUserDto>{ role: 'admin' })
                .expect(status.UNAUTHORIZED, done);
        });

        it('should not allow coordinators to edit a role', (done) => {
            request.put('/api/users/' + user2.id)
                .set('Authorization', generatedUsers.coordinator.token)
                .send(<EditUserDto>{ role: 'admin' })
                .expect(status.UNAUTHORIZED, done);
        });

        it('should not allow self role edits', (done) => {
            request.put('/api/users/' + user2.id)
                .set('Authorization', user2Token)
                .send(<EditUserDto>{ role: 'admin' })
                .expect(status.UNAUTHORIZED, done);
        });

        it('should not allow teachers to edit other passwords', (done) => {
            request.put('/api/users/' + user2.id)
                .set('Authorization', generatedUsers.teacher.token)
                .send(<EditUserDto>{ password: 'oops' })
                .expect(status.UNAUTHORIZED, done);
        });

        it('should allow admins to edit a password', (done) => {
            request.put('/api/users/' + user2.id)
                .set('Authorization', generatedUsers.admin.token)
                .send(<EditUserDto>{ password: 'oops' })
                .expect(status.OK, done);
        });

        it('should allow admins to edit a password', (done) => {
            request.put('/api/users/' + user2.id)
                .set('Authorization', generatedUsers.admin.token)
                .send(<EditUserDto>{ password: 'new' })
                .expect(status.OK)
                .end((err, res: SuperTestResponse<EditUserResponseDto>) => {
                    if (err) { return done(err); }
                    expect(res.body.token).to.exist;
                    done();
                });
        });
    });

    describe('deleting accounts', () => {
        let coordinator: UserInterface;
        let teacher: UserInterface;
        let coordinatorToken: string;
        let teacherToken: string;

        beforeEach((done) => {
            coordinator = {
                email: 'test1@test.com',
                password: 'password',
                firstname: 'firstname',
                lastname: 'lastname',
                role: UserRole.COORDINATOR,
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
                role: UserRole.TEACHER,
                details: {
                    chapter: 'Book'
                }
            };

            async.series([
                (cb) => {
                    request.post('/api/signup')
                        .send(coordinator)
                        .expect(status.CREATED)
                        .end((err, res: SuperTestResponse<UserTokenResponseDto>) => {
                            if (err) { return done(err); }
                            coordinator.id = res.body.profile.id;
                            coordinatorToken = res.body.token;
                            return cb();
                        });
                },
                (cb) => {
                    request.post('/api/signup')
                        .send(teacher)
                        .expect(status.CREATED)
                        .end((err, res: SuperTestResponse<UserTokenResponseDto>) => {
                            if (err) { return done(err); }
                            teacher.id = res.body.profile.id;
                            teacherToken = res.body.token;
                            return cb();
                        });
                }
            ], done);
        });

        it('should delete own account', (done) => {
            async.series([
                (cb) => {
                    request.get('/api/users/' + coordinator.id)
                        .set('Authorization', coordinatorToken)
                        .expect(status.OK)
                        .end((err, res: SuperTestResponse<UsersResponseDto>) => {
                            if (err) { return done(err); }
                            expect(res.body[0].id).to.equal(coordinator.id);
                            cb();
                        });
                },
                (cb) => {
                    request.del('/api/users/' + coordinator.id)
                        .set('Authorization', coordinatorToken)
                        .expect(status.OK, cb);
                },
                (cb) => {
                    request.get('/api/users/' + coordinator.id)
                        .set('Authorization', generatedUsers.admin.token)
                        .expect(status.BAD_REQUEST, cb);
                }
            ], done);
        });

        it('should not delete another users account', (done) => {
            request.del('/api/users/' + coordinator.id)
                .set('Authorization', teacherToken)
                .expect(status.UNAUTHORIZED, done);
        });

        it('should require a token', (done) => {
            request.del('/api/users/' + coordinator.id)
                .expect(status.UNAUTHORIZED, done);
        });

        it('should allow admins to delete accounts', (done) => {
            request.del('/api/users/' + coordinator.id)
                .set('Authorization', generatedUsers.admin.token)
                .expect(status.OK, done);
        });

        it('should fail gracefully if a user isnt found', (done) => {
            request.del('/api/users/walal')
                .set('Authorization', generatedUsers.admin.token)
                .expect(status.BAD_REQUEST, done);
        });

        it('should require an id', (done) => {
            request.del('/api/users')
                .set('Authorization', generatedUsers.admin.token)
                .expect(status.NOT_FOUND, done);
        });
    });

    describe('account approval', () => {
        it('should default new accounts to not approved', (done) => {
            const postData: SignupRequestDto = {
                email: 'test@test.com',
                password: 'helloworld',
                firstname: 'firstname',
                lastname: 'lastname'
            };

            request.post('/api/signup')
                .send(postData)
                .expect(status.CREATED)
                .end((err, res: SuperTestResponse<UserTokenResponseDto>) => {
                    if (err) { return done(err); }
                    expect(res.body.profile.approved).to.be.false;
                    return done();
                });
        });

        it('should not allow approval to be set by creator', (done) => {
            const postData: any = {
                email: 'test@test.com',
                password: 'helloworld',
                firstname: 'firstname',
                lastname: 'lastname',
                approved: true
            };

            request.post('/api/signup')
                .send(postData)
                .expect(status.CREATED)
                .end((err, res: SuperTestResponse<UserTokenResponseDto>) => {
                    if (err) { return done(err); }
                    expect(res.body.profile.approved).to.be.false;
                    return done();
                });
        });

        it('should allow admins to change an accounts approval status', (done) => {
            let accountId: number;

            async.series([
                (cb) => {
                    const postData: SignupRequestDto = {
                        email: 'test@test.com',
                        password: 'helloworld',
                        firstname: 'firstname',
                        lastname: 'lastname'
                    };

                    request.post('/api/signup')
                        .send(postData)
                        .expect(status.CREATED)
                        .end((err, res: SuperTestResponse<UserTokenResponseDto>) => {
                            if (err) { return done(err); }
                            expect(res.body.profile.approved).to.be.false;
                            accountId = res.body.profile.id;
                            return cb();
                        });
                },
                (cb) => {
                    request.put('/api/users/' + accountId)
                        .set('Authorization', generatedUsers.admin.token)
                        .send({ approved: true })
                        .expect(status.OK)
                        .end((err, res) => {
                            if (err) { return done(err); }
                            expect(res.body.profile.approved).to.be.true;
                            expect(res.body.profile.id).to.equal(accountId);
                            return cb();
                        });
                }
            ], done);
        });

        it('should not allow coordinators to change account approval status', (done) => {
            let accountId: number;

            async.series([
                (cb) => {
                    const postData: SignupRequestDto = {
                        email: 'test@test.com',
                        password: 'helloworld',
                        firstname: 'firstname',
                        lastname: 'lastname'
                    };

                    request.post('/api/signup')
                        .send(postData)
                        .expect(status.CREATED)
                        .end((err, res: SuperTestResponse<UserTokenResponseDto>) => {
                            if (err) { return done(err); }
                            expect(res.body.profile.approved).to.be.false;
                            accountId = res.body.profile.id;
                            return cb();
                        });
                },
                (cb) => {
                    request.put('/api/users/' + accountId)
                        .set('Authorization', generatedUsers.coordinator.token)
                        .send(<EditUserDto>{ approved: true })
                        .expect(status.UNAUTHORIZED, cb);
                }
            ], done);
        });

        it('should not allow teachers to change account approval status', (done) => {
            let accountId: number;

            async.series([
                (cb) => {
                    const postData: SignupRequestDto = {
                        email: 'test@test.com',
                        password: 'helloworld',
                        firstname: 'firstname',
                        lastname: 'lastname'
                    };

                    request.post('/api/signup')
                        .send(postData)
                        .expect(status.CREATED)
                        .end((err, res) => {
                            if (err) { return done(err); }
                            expect(res.body.profile.approved).to.be.false;
                            accountId = res.body.profile.id;
                            return cb();
                        });
                },
                (cb) => {
                    request.put('/api/users/' + accountId)
                        .set('Authorization', generatedUsers.teacher.token)
                        .send(<EditUserDto>{ approved: true })
                        .expect(status.UNAUTHORIZED, cb);
                }
            ], done);
        });

        it('should require approval for protected routes', (done) => {
            let token: string;
            let accountId: number;
            const exampleScout: ScoutInterface = {
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
                (cb) => {
                    const postData: SignupRequestDto = {
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
                        .end((err, res: SuperTestResponse<UserTokenResponseDto>) => {
                            if (err) { return done(err); }
                            expect(res.body.profile.approved).to.be.false;
                            accountId = res.body.profile.id;
                            token = res.body.token;
                            return cb();
                        });
                },
                (cb) => {
                    request.post('/api/users/' + accountId + '/scouts')
                        .set('Authorization', token)
                        .send(exampleScout)
                        .expect(status.UNAUTHORIZED, cb);
                }
            ], done);
        });

        it('should allow changes once an account is approved', (done) => {
            let token: string;
            let accountId: number;
            const exampleScout: ScoutInterface = {
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
                (cb) => {
                    const postData: SignupRequestDto = {
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
                        .end((err, res: SuperTestResponse<UserTokenResponseDto>) => {
                            if (err) { return done(err); }
                            expect(res.body.profile.approved).to.be.false;
                            accountId = res.body.profile.id;
                            token = res.body.token;
                            return cb();
                        });
                },
                (cb) => {
                    request.post('/api/users/' + accountId + '/scouts')
                        .set('Authorization', token)
                        .send(exampleScout)
                        .expect(status.UNAUTHORIZED, cb);
                },
                (cb) => {
                    request.put('/api/users/' + accountId)
                        .set('Authorization', generatedUsers.admin.token)
                        .send({ approved: true })
                        .expect(status.OK)
                        .end((err, res: SuperTestResponse<EditUserResponseDto>) => {
                            if (err) { return done(err); }
                            expect(res.body.profile.approved).to.be.true;
                            expect(res.body.profile.id).to.equal(accountId);
                            return cb();
                        });
                },
                (cb) => {
                    request.post('/api/users/' + accountId + '/scouts')
                        .set('Authorization', token)
                        .send(exampleScout)
                        .expect(status.CREATED, cb);
                }
            ], done);
        });
    });
});
