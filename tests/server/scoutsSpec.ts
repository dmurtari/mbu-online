import supertest from 'supertest';
import * as async from 'async';
import status from 'http-status-codes';
import { expect } from 'chai';

import app from '@app/app';
import TestUtils, { RoleTokenObjects } from './testUtils';
import testScouts from './testScouts';
import { ScoutInterface } from '@interfaces/scout.interface';
import { UserRole } from '@interfaces/user.interface';

const request = supertest(app);

describe.only('scouts', () => {
    let generatedUsers: RoleTokenObjects;
    let exampleScout: ScoutInterface;
    const badId = TestUtils.badId;

    before(async () => {
        await TestUtils.dropDb();
    });

    before(async () => {
        generatedUsers = await TestUtils.generateTokens([
            UserRole.ADMIN,
            UserRole.TEACHER,
            UserRole.COORDINATOR,
            'coordinator2' as any
        ]);
    });

    beforeEach(() => {
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

    afterEach(async () => {
        TestUtils.removeScoutsForUser(generatedUsers.coordinator);
    });

    after(async () => {
        await TestUtils.dropDb();
    });

    describe('in order to be associated with users', () => {
        it('should be able to be created', (done) => {
            request.post('/api/users/' + generatedUsers.coordinator.profile.id + '/scouts')
                .set('Authorization', generatedUsers.coordinator.token)
                .send(exampleScout)
                .expect(status.CREATED)
                .end((err, res) => {
                    if (err) { return done(err); }
                    const scout = res.body.scout;
                    // expect(scout.name).to.equal(exampleScout.name);
                    expect(scout.emergency_name).to.contain(exampleScout.emergency_name);
                    expect(scout.emergency_relation).to.contain(exampleScout.emergency_relation);
                    expect(scout.emergency_phone).to.contain(exampleScout.emergency_phone);
                    expect(scout.troop).to.equal(exampleScout.troop);
                    expect(scout.notes).to.equal(exampleScout.notes);
                    expect(new Date(scout.birthday)).to.deep.equal(exampleScout.birthday);
                    return done();
                });
        });

        it('should not be created by a different coordinator', (done) => {
            request.post('/api/users/' + generatedUsers.coordinator.profile.id + '/scouts')
                .set('Authorization', generatedUsers.coordinator2.token)
                .send(exampleScout)
                .expect(status.UNAUTHORIZED, done);
        });

        it('should be able to be created by teachers', (done) => {
            request.post('/api/users/' + generatedUsers.coordinator.profile.id + '/scouts')
                .set('Authorization', generatedUsers.teacher.token)
                .send(exampleScout)
                .expect(status.CREATED, done);
        });

        it('should be able to be created by admins', (done) => {
            request.post('/api/users/' + generatedUsers.coordinator.profile.id + '/scouts')
                .set('Authorization', generatedUsers.admin.token)
                .send(exampleScout)
                .expect(status.CREATED, done);
        });

        it('should require authorization', (done) => {
            request.post('/api/users/' + generatedUsers.coordinator.profile.id + '/scouts')
                .send(exampleScout)
                .expect(status.UNAUTHORIZED, done);
        });

        it('should require valid scouts', (done) => {
            const postData = exampleScout;
            postData.birthday = new Date(4000, 1, 1);

            request.post('/api/users/' + generatedUsers.coordinator.profile.id + '/scouts')
                .set('Authorization', generatedUsers.coordinator.token)
                .send(postData)
                .expect(status.BAD_REQUEST, done);
        });

        it('should not allow scouts to be associated with non-coordinators', (done) => {
            request.post('/api/users/' + generatedUsers.teacher.profile.id + '/scouts')
                .set('Authorization', generatedUsers.teacher.token)
                .send(exampleScout)
                .expect(status.BAD_REQUEST, done);
        });

        it('should not create a scout for an invalid id', (done) => {
            request.post('/api/users/' + badId + '/scouts')
                .set('Authorization', generatedUsers.coordinator.token)
                .send(exampleScout)
                .expect(status.UNAUTHORIZED, done);
        });
    });

    describe('when scouts exist', () => {
        const scoutCount = 5;
        let scouts: ScoutInterface[];

        beforeEach(async () => {
            TestUtils.removeScoutsForUser(generatedUsers.coordinator);
        });

        beforeEach(async () => {
            scouts = await TestUtils.createScoutsForUser(generatedUsers.coordinator, testScouts(scoutCount));
        });

        describe('seeing registered scouts', () => {
            it('should be able to get scouts for a user', (done) => {
                request.get('/api/users/' + generatedUsers.coordinator.profile.id + '/scouts')
                    .set('Authorization', generatedUsers.coordinator.token)
                    .expect(status.OK)
                    .end((err, res) => {
                        if (err) { return done(err); }
                        const user = res.body[0];
                        expect(user.scouts.length).to.equal(scoutCount);
                        return done();
                    });
            });

            it('should let admins get scouts for a user', (done) => {
                request.get('/api/users/' + generatedUsers.coordinator.profile.id + '/scouts')
                    .set('Authorization', generatedUsers.admin.token)
                    .expect(status.OK)
                    .end((err, res) => {
                        if (err) { return done(err); }
                        const user = res.body[0];
                        expect(user.scouts.length).to.equal(scoutCount);
                        return done();
                    });
            });

            it('should let teachers get scouts for a user', (done) => {
                request.get('/api/users/' + generatedUsers.coordinator.profile.id + '/scouts')
                    .set('Authorization', generatedUsers.teacher.token)
                    .expect(status.OK)
                    .end((err, res) => {
                        if (err) { return done(err); }
                        const user = res.body[0];
                        expect(user.scouts.length).to.equal(scoutCount);
                        return done();
                    });
            });

            it('should not get scouts if the user doesnt exist', (done) => {
                request.get('/api/users/' + badId + '/scouts')
                    .set('Authorization', generatedUsers.admin.token)
                    .expect(status.BAD_REQUEST, done);
            });

            it('should not get scouts with an invalid query', (done) => {
                request.get('/api/users?age=250')
                    .set('Authorization', generatedUsers.admin.token)
                    .expect(status.BAD_REQUEST, done);
            });
        });

        describe.only('updating registered scouts', () => {
            let scoutUpdate: ScoutInterface;

            beforeEach(() => {
                scoutUpdate = Object.assign({}, scouts[0]);
            });

            it('should be able to update a scouts information', (done) => {
                scoutUpdate.firstname = 'Updated';
                scoutUpdate.lastname = 'Scout';
                scoutUpdate.emergency_name = 'Incompetent';

                request.put('/api/users/' + generatedUsers.coordinator.profile.id + '/scouts/' + scouts[0].id)
                    .set('Authorization', generatedUsers.coordinator.token)
                    .send(scoutUpdate)
                    .expect(status.OK)
                    .end((err, res) => {
                        if (err) { return done(err); }
                        const scout = res.body.scout;
                        expect(scout.id).to.equal(scouts[0].id);
                        expect(scout.firstname).to.equal('Updated');
                        expect(scout.lastname).to.equal('Scout');
                        return done();
                    });
            });

            it('should allow fields to be deleted', (done) => {
                scoutUpdate.notes = null;
                request.put('/api/users/' + generatedUsers.coordinator.profile.id + '/scouts/' + scouts[0].id)
                    .set('Authorization', generatedUsers.coordinator.token)
                    .send(scoutUpdate)
                    .expect(status.OK)
                    .end((err, res) => {
                        if (err) { return done(err); }
                        const scout = res.body.scout;
                        expect(scout.notes).to.not.exist;
                        return done();
                    });
            });

            it('should allow updates from teachers', (done) => {
                request.put('/api/users/' + generatedUsers.coordinator.profile.id + '/scouts/' + scouts[0].id)
                    .set('Authorization', generatedUsers.teacher.token)
                    .send(scoutUpdate)
                    .expect(status.OK, done);
            });

            it('should allow updates from admins', (done) => {
                request.put('/api/users/' + generatedUsers.coordinator.profile.id + '/scouts/' + scouts[0].id)
                    .set('Authorization', generatedUsers.admin.token)
                    .send(scoutUpdate)
                    .expect(status.OK, done);
            });

            it('should not allow update from a different coordinator', (done) => {
                request.put('/api/users/' + generatedUsers.coordinator.profile.id + '/scouts/' + scouts[0].id)
                    .set('Authorization', generatedUsers.coordinator2.token)
                    .send(scoutUpdate)
                    .expect(status.UNAUTHORIZED, done);
            });

            it('should not update with invalid fields', (done) => {
                scoutUpdate.birthday = new Date(4000, 1, 1);
                request.put('/api/users/' + generatedUsers.coordinator.profile.id + '/scouts/' + scouts[0].id)
                    .set('Authorization', generatedUsers.coordinator.token)
                    .send(scoutUpdate)
                    .expect(status.BAD_REQUEST, done);
            });

            it('should not update a nonexistent user', (done) => {
                request.put('/api/users/' + badId + '/scouts/' + scouts[0].id)
                    .set('Authorization', generatedUsers.coordinator.token)
                    .send(scoutUpdate)
                    .expect(status.UNAUTHORIZED, done);
            });

            it('should not update nonexistent scouts', (done) => {
                request.put('/api/users/' + generatedUsers.coordinator.profile.id + '/scouts/' + badId)
                    .set('Authorization', generatedUsers.coordinator.token)
                    .send(scoutUpdate)
                    .expect(status.BAD_REQUEST, done);
            });
        });

        describe('deleting scouts', () => {
            it('should delete scouts for a user', (done) => {
                async.series([
                    (cb) => {
                        request.get('/api/users/' + generatedUsers.coordinator.profile.id + '/scouts')
                            .set('Authorization', generatedUsers.admin.token)
                            .expect(status.OK)
                            .end((err, res) => {
                                if (err) { return done(err); }
                                expect(res.body[0].scouts).to.have.lengthOf(scoutCount);
                                return cb();
                            });
                    },
                    (cb) => {
                        request.del('/api/users/' + generatedUsers.coordinator.profile.id + '/scouts/' + scouts[0].id)
                            .set('Authorization', generatedUsers.coordinator.token)
                            .expect(status.OK, cb);
                    },
                    (cb) => {
                        request.get('/api/users/' + generatedUsers.coordinator.profile.id + '/scouts')
                            .set('Authorization', generatedUsers.admin.token)
                            .expect(status.OK)
                            .end((err, res) => {
                                if (err) { return done(err); }
                                expect(res.body[0].scouts).to.have.lengthOf(scoutCount - 1);
                                return cb();
                            });
                    }
                ], done);
            });

            it('should require authorization', (done) => {
                request.del('/api/users/' + generatedUsers.coordinator.profile.id + '/scouts/' + scouts[0].id)
                    .expect(status.UNAUTHORIZED, done);
            });

            it('should check for the correct owner', (done) => {
                request.del('/api/users/' + generatedUsers.coordinator.profile.id + '/scouts/' + scouts[0].id)
                    .set('Authorization', generatedUsers.coordinator2.token)
                    .expect(status.UNAUTHORIZED, done);
            });

            it('should allow admins to delete', (done) => {
                request.del('/api/users/' + generatedUsers.coordinator.profile.id + '/scouts/' + scouts[0].id)
                    .set('Authorization', generatedUsers.admin.token)
                    .expect(status.OK, done);
            });

            it('should allow teachers to delete', (done) => {
                request.del('/api/users/' + generatedUsers.coordinator.profile.id + '/scouts/' + scouts[0].id)
                    .set('Authorization', generatedUsers.teacher.token)
                    .expect(status.OK, done);
            });

            it('should not delete from nonexistent users', (done) => {
                request.del('/api/users/' + badId + '/scouts/' + scouts[0].id)
                    .set('Authorization', generatedUsers.coordinator.token)
                    .expect(status.UNAUTHORIZED, done);
            });

            it('should not delete nonexistent scouts', (done) => {
                request.del('/api/users/' + generatedUsers.coordinator.profile.id + '/scouts/' + badId)
                    .set('Authorization', generatedUsers.coordinator.token)
                    .expect(status.BAD_REQUEST, done);
            });
        });
    });
});
