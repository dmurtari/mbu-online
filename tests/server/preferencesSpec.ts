import supertest from 'supertest';
import * as async from 'async';
import status from 'http-status-codes';
import { expect } from 'chai';

import app from '@app/app';
import TestUtils, { RoleTokenObjects } from './testUtils';
import testScouts from './testScouts';
import { Badge } from '@models/badge.model';
import { Event } from '@models/event.model';
import { Scout } from '@models/scout.model';
import { Offering } from '@models/offering.model';
import { UserRole } from '@interfaces/user.interface';
import { OfferingInterface } from '@interfaces/offering.interface';
import { Registration } from '@models/registration.model';
import {
    CreatePreferenceRequestDto,
    CreatePreferenceResponseDto,
    ScoutPreferenceResponseDto,
    UpdatePreferenceRequestDto
} from '@interfaces/preference.interface';
import { Preference } from '@models/preference.model';
import { RegistrationRequestDto, CreateRegistrationResponseDto } from '@interfaces/registration.interface';
import { SuperTestResponse } from '@test/helpers/supertest.interface';

const request = supertest(app);

describe('preferences', () => {
    let badges: Badge[];
    let events: Event[];
    let generatedUsers: RoleTokenObjects;
    let generatedScouts: Scout[];
    let generatedOfferings: Offering[];
    let scoutId: string;
    let registrationIds: number[] = [];

    const badId = TestUtils.badId;

    before(async () => {
        await TestUtils.dropDb();
    });

    before(async () => {
        generatedUsers = await TestUtils.generateTokens([UserRole.ADMIN, UserRole.TEACHER, UserRole.COORDINATOR, 'coordinator2' as any]);
        badges = await TestUtils.createBadges();
        events = await TestUtils.createEvents();

        const defaultPostData: OfferingInterface = {
            price: 10,
            periods: [1, 2, 3],
            duration: 1
        };

        generatedOfferings = await TestUtils.createOfferingsForEvent(events[0], badges, defaultPostData);
    });

    beforeEach(async () => {
        await TestUtils.dropTable([Registration, Preference]);
        generatedScouts = await TestUtils.createScoutsForUser(generatedUsers.coordinator, testScouts(5));
    });

    beforeEach((done) => {
        scoutId = generatedScouts[0].id;
        registrationIds = [];
        async.series([
            (cb) => {
                request.post('/api/scouts/' + scoutId + '/registrations')
                    .set('Authorization', generatedUsers.coordinator.token)
                    .send(<RegistrationRequestDto>{
                        event_id: events[0].id
                    })
                    .expect(status.CREATED)
                    .end((err, res: SuperTestResponse<CreateRegistrationResponseDto>) => {
                        if (err) { return done(err); }
                        registrationIds.push(res.body.registration.id);
                        return cb();
                    });
            },
            (cb) => {
                request.post('/api/scouts/' + scoutId + '/registrations')
                    .set('Authorization', generatedUsers.coordinator.token)
                    .send(<RegistrationRequestDto>{
                        event_id: events[1].id
                    })
                    .expect(status.CREATED)
                    .end((err, res: SuperTestResponse<CreateRegistrationResponseDto>) => {
                        if (err) { return done(err); }
                        registrationIds.push(res.body.registration.id);
                        return cb();
                    });
            }
        ], done);
    });

    after(async () => {
        await TestUtils.dropDb();
    });

    describe('when preferences do not exist', () => {
        it('should be able to be generated', (done) => {
            const postData: CreatePreferenceRequestDto = {
                offering: generatedOfferings[0].id,
                rank: 1
            };

            request.post('/api/scouts/' + generatedScouts[0].id + '/registrations/' +
                registrationIds[0] + '/preferences')
                .set('Authorization', generatedUsers.coordinator.token)
                .send(postData)
                .expect(status.CREATED)
                .end((err, res: SuperTestResponse<CreatePreferenceResponseDto>) => {
                    if (err) { return done(err); }
                    const registration = res.body.registration;
                    expect(registration.preferences).to.have.length(1);
                    const preference = registration.preferences[0];
                    expect(preference.badge_id).to.exist;
                    expect(preference.offering_id).to.equal(postData.offering);
                    expect(preference.details.rank).to.equal(postData.rank);
                    return done();
                });
        });

        it('should check for scout owner', (done) => {
            const postData: CreatePreferenceRequestDto = {
                offering: generatedOfferings[0].id,
                rank: 1
            };

            request.post('/api/scouts/' + generatedScouts[0].id + '/registrations/' +
                registrationIds[0] + '/preferences')
                .set('Authorization', generatedUsers.coordinator2.token)
                .send(postData)
                .expect(status.UNAUTHORIZED, done);
        });

        it('should allow teachers to create', (done) => {
            const postData: CreatePreferenceRequestDto = {
                offering: generatedOfferings[0].id,
                rank: 1
            };

            request.post('/api/scouts/' + generatedScouts[0].id + '/registrations/' +
                registrationIds[0] + '/preferences')
                .set('Authorization', generatedUsers.teacher.token)
                .send(postData)
                .expect(status.CREATED, done);
        });

        it('should allow admins to create', (done) => {
            const postData: CreatePreferenceRequestDto = {
                offering: generatedOfferings[0].id,
                rank: 1
            };

            request.post('/api/scouts/' + generatedScouts[0].id + '/registrations/' +
                registrationIds[0] + '/preferences')
                .set('Authorization', generatedUsers.admin.token)
                .send(postData)
                .expect(status.CREATED, done);
        });

        it('should not create for a nonexistant offering', (done) => {
            const postData: CreatePreferenceRequestDto = {
                offering: badId as any,
                rank: 1
            };

            request.post('/api/scouts/' + generatedScouts[0].id + '/registrations/' +
                registrationIds[0] + '/preferences')
                .set('Authorization', generatedUsers.coordinator.token)
                .send(postData)
                .expect(status.BAD_REQUEST, done);
        });

        it('should not create for nonexistant registrations', (done) => {
            const postData: CreatePreferenceRequestDto = {
                offering: generatedOfferings[0].id,
                rank: 1
            };

            request.post('/api/scouts/' + generatedScouts[0].id + '/registrations/' + badId + '/preferences')
                .set('Authorization', generatedUsers.coordinator.token)
                .send(postData)
                .expect(status.BAD_REQUEST, done);
        });

        it('should not have a maximum rank of 6', (done) => {
            const postData: CreatePreferenceRequestDto = {
                offering: generatedOfferings[0].id,
                rank: 7
            };

            request.post('/api/scouts/' + generatedScouts[0].id + '/registrations/' +
                registrationIds[0] + '/preferences')
                .set('Authorization', generatedUsers.coordinator.token)
                .send(postData)
                .expect(status.BAD_REQUEST, done);
        });

        it('should not have a minimum rank of 1', (done) => {
            const postData: CreatePreferenceRequestDto = {
                offering: generatedOfferings[0].id,
                rank: 0
            };

            request.post('/api/scouts/' + generatedScouts[0].id + '/registrations/' +
                registrationIds[0] + '/preferences')
                .set('Authorization', generatedUsers.coordinator.token)
                .send(postData)
                .expect(status.BAD_REQUEST, done);
        });
    });

    describe('when preferences exist', () => {
        beforeEach((done) => {
            async.series([
                (cb) => {
                    request.post('/api/scouts/' + generatedScouts[0].id + '/registrations/' +
                        registrationIds[0] + '/preferences')
                        .set('Authorization', generatedUsers.coordinator.token)
                        .send(<CreatePreferenceRequestDto>{
                            offering: generatedOfferings[0].id,
                            rank: 1
                        })
                        .expect(status.CREATED, cb);
                },
                (cb) => {
                    request.post('/api/scouts/' + generatedScouts[0].id + '/registrations/' +
                        registrationIds[0] + '/preferences')
                        .set('Authorization', generatedUsers.coordinator.token)
                        .send(<CreatePreferenceRequestDto>{
                            offering: generatedOfferings[1].id,
                            rank: 2
                        })
                        .expect(status.CREATED, cb);
                },
                (cb) => {
                    request.post('/api/scouts/' + generatedScouts[0].id + '/registrations/' +
                        registrationIds[1] + '/preferences')
                        .set('Authorization', generatedUsers.coordinator.token)
                        .send(<CreatePreferenceRequestDto>{
                            offering: generatedOfferings[0].id,
                            rank: 3
                        })
                        .expect(status.CREATED, cb);
                }
            ], done);
        });

        describe('getting preferences', () => {
            it('should get all preferences for a registration', (done) => {
                request.get('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/preferences')
                    .set('Authorization', generatedUsers.coordinator.token)
                    .expect(status.OK)
                    .end((err, res: SuperTestResponse<ScoutPreferenceResponseDto>) => {
                        if (err) { return done(err); }
                        const preferences = res.body;
                        expect(preferences).to.have.length(2);
                        expect(preferences[0].badge_id).to.exist;
                        expect(preferences[0].offering_id).to.equal(generatedOfferings[0].id);
                        expect(preferences[0].details.rank).to.equal(1);
                        expect(preferences[1].badge_id).to.exist;
                        expect(preferences[1].offering_id).to.equal(generatedOfferings[1].id);
                        expect(preferences[1].details.rank).to.equal(2);
                        return done();
                    });
            });

            it('should not get with an incorrect scout', (done) => {
                request.get('/api/scouts/' + badId + '/registrations/' + registrationIds[0] + '/preferences')
                    .set('Authorization', generatedUsers.coordinator.token)
                    .expect(status.BAD_REQUEST, done);
            });

            it('should not get with an incorrect registration', (done) => {
                request.get('/api/scouts/' + generatedScouts[0].id + '/registrations/' + badId + '/preferences')
                    .set('Authorization', generatedUsers.coordinator.token)
                    .expect(status.BAD_REQUEST, done);
            });
        });

        describe('updating preferences', () => {
            it('should update a preference rank', (done) => {
                async.series([
                    (cb) => {
                        request.get('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/preferences')
                            .set('Authorization', generatedUsers.coordinator.token)
                            .expect(status.OK)
                            .end((err, res: SuperTestResponse<ScoutPreferenceResponseDto>) => {
                                if (err) { return done(err); }
                                const preference = res.body.find((_preference) => _preference.offering_id === 1);
                                expect(preference.details.rank).to.equal(1);
                                return cb();
                            });
                    },
                    (cb) => {
                        // tslint:disable-next-line: max-line-length
                        request.put('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/preferences/' + generatedOfferings[0].id)
                            .set('Authorization', generatedUsers.coordinator.token)
                            .send(<UpdatePreferenceRequestDto>{
                                rank: 3
                            })
                            .expect(status.OK, cb);
                    },
                    (cb) => {
                        request.get('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/preferences')
                            .set('Authorization', generatedUsers.coordinator.token)
                            .expect(status.OK)
                            .end((err, res: SuperTestResponse<ScoutPreferenceResponseDto>) => {
                                if (err) { return done(err); }
                                const preference = res.body.find((_preference) => _preference.offering_id === 1);
                                expect(preference.details.rank).to.equal(3);
                                return cb();
                            });
                    },
                ], done);
            });

            it('should check for the owner', (done) => {
                request.put('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/preferences/' + generatedOfferings[0].id)
                    .set('Authorization', generatedUsers.coordinator2.token)
                    .send(<UpdatePreferenceRequestDto>{
                        rank: 3
                    })
                    .expect(status.UNAUTHORIZED, done);
            });

            it('should allow teachers to update', (done) => {
                request.put('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/preferences/' + generatedOfferings[0].id)
                    .set('Authorization', generatedUsers.teacher.token)
                    .send(<UpdatePreferenceRequestDto>{
                        rank: 3
                    })
                    .expect(status.OK, done);
            });

            it('should allow admins to update', (done) => {
                request.put('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/preferences/' + generatedOfferings[0].id)
                    .set('Authorization', generatedUsers.admin.token)
                    .send(<UpdatePreferenceRequestDto>{
                        rank: 3
                    })
                    .expect(status.OK, done);
            });

            it('should not update an invalid preference', (done) => {
                request.put('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/preferences/' + badId)
                    .set('Authorization', generatedUsers.coordinator.token)
                    .expect(status.BAD_REQUEST, done);
            });

            it('should not update an invalid registration', (done) => {
                request.put('/api/scouts/' + scoutId + '/registrations/' + badId + '/preferences/' + generatedOfferings[0].id)
                    .set('Authorization', generatedUsers.coordinator.token)
                    .expect(status.BAD_REQUEST, done);
            });

            it('should not update for an invalid scout', (done) => {
                request.put('/api/scouts/' + badId + '/registrations/' + registrationIds[0] + '/preferences/' + generatedOfferings[0].id)
                    .set('Authorization', generatedUsers.coordinator.token)
                    .expect(status.BAD_REQUEST, done);
            });
        });

        describe('deleting preferences', () => {
            it('should delete an existing preference', (done) => {
                async.series([
                    (cb) => {
                        request.get('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/preferences')
                            .set('Authorization', generatedUsers.coordinator.token)
                            .expect(status.OK)
                            .end((err, res: SuperTestResponse<ScoutPreferenceResponseDto>) => {
                                if (err) { return done(err); }
                                expect(res.body).to.have.length(2);
                                return cb();
                            });
                    },
                    (cb) => {
                        // tslint:disable-next-line: max-line-length
                        request.del('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/preferences/' + generatedOfferings[0].id)
                            .set('Authorization', generatedUsers.coordinator.token)
                            .expect(status.OK, cb);
                    },
                    (cb) => {
                        request.get('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/preferences')
                            .set('Authorization', generatedUsers.coordinator.token)
                            .expect(status.OK)
                            .end((err, res: SuperTestResponse<ScoutPreferenceResponseDto>) => {
                                expect(res.body).to.have.length(1);
                                return cb();
                            });
                    },
                ], done);
            });

            it('should check for the correct owner', (done) => {
                request.del('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/preferences/' + generatedOfferings[0].id)
                    .set('Authorization', generatedUsers.coordinator2.token)
                    .expect(status.UNAUTHORIZED, done);
            });

            it('should allow teachers to delete', (done) => {
                request.del('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/preferences/' + generatedOfferings[0].id)
                    .set('Authorization', generatedUsers.teacher.token)
                    .expect(status.OK, done);
            });

            it('should allow admins to delete', (done) => {
                request.del('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/preferences/' + generatedOfferings[0].id)
                    .set('Authorization', generatedUsers.admin.token)
                    .expect(status.OK, done);
            });

            it('should not delete an invalid preference', (done) => {
                request.del('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/preferences/' + badId)
                    .set('Authorization', generatedUsers.coordinator.token)
                    .expect(status.BAD_REQUEST, done);
            });

            it('should not delete an invalid registration', (done) => {
                request.del('/api/scouts/' + scoutId + '/registrations/' + badId + '/preferences/' + generatedOfferings[0].id)
                    .set('Authorization', generatedUsers.coordinator.token)
                    .expect(status.BAD_REQUEST, done);
            });

            it('should not delete for an invalid scout', (done) => {
                request.del('/api/scouts/' + badId + '/registrations/' + registrationIds[0] + '/preferences/' + generatedOfferings[0].id)
                    .set('Authorization', generatedUsers.coordinator.token)
                    .expect(status.BAD_REQUEST, done);
            });
        });
    });

    describe('batch modifying preferences', () => {

        it('should add a batch of preferences', (done) => {
            const postData: CreatePreferenceRequestDto[] = [{
                offering: generatedOfferings[0].id,
                rank: 1
            }, {
                offering: generatedOfferings[1].id,
                rank: 2
            }];

            request.post('/api/scouts/' + generatedScouts[0].id + '/registrations/' + registrationIds[0] + '/preferences')
                .set('Authorization', generatedUsers.coordinator.token)
                .send(postData)
                .expect(status.CREATED)
                .end((err, res: SuperTestResponse<CreatePreferenceResponseDto>) => {
                    if (err) { return done(err); }
                    const registration = res.body.registration;
                    expect(registration.preferences).to.have.length(2);
                    const preferences = registration.preferences;
                    expect(preferences[0].badge_id).to.exist;
                    expect(preferences[0].offering_id).to.equal(postData[0].offering);
                    expect(preferences[0].details.rank).to.equal(postData[0].rank);
                    expect(preferences[1].badge_id).to.exist;
                    expect(preferences[1].offering_id).to.equal(postData[1].offering);
                    expect(preferences[1].details.rank).to.equal(postData[1].rank);
                    return done();
                });
        });

        it('should override existing preferences', (done) => {
            async.series([
                (cb) => {
                    const postData: CreatePreferenceRequestDto[] = [{
                        offering: generatedOfferings[0].id,
                        rank: 1
                    }, {
                        offering: generatedOfferings[1].id,
                        rank: 2
                    }];

                    request.post('/api/scouts/' + generatedScouts[0].id + '/registrations/' + registrationIds[0] + '/preferences')
                        .set('Authorization', generatedUsers.coordinator.token)
                        .send(postData)
                        .expect(status.CREATED)
                        .end((err, res: SuperTestResponse<CreatePreferenceResponseDto>) => {
                            if (err) { return done(err); }
                            const registration = res.body.registration;
                            expect(registration.preferences).to.have.length(2);
                            const preferences = registration.preferences;
                            expect(preferences[0].badge_id).to.exist;
                            expect(preferences[0].offering_id).to.equal(postData[0].offering);
                            expect(preferences[0].details.rank).to.equal(postData[0].rank);
                            expect(preferences[1].badge_id).to.exist;
                            expect(preferences[1].offering_id).to.equal(postData[1].offering);
                            expect(preferences[1].details.rank).to.equal(postData[1].rank);
                            return cb();
                        });
                },
                (cb) => {
                    const postData: CreatePreferenceRequestDto[] = [{
                        offering: generatedOfferings[2].id,
                        rank: 1
                    }];

                    request.post('/api/scouts/' + generatedScouts[0].id + '/registrations/' + registrationIds[0] + '/preferences')
                        .set('Authorization', generatedUsers.coordinator.token)
                        .send(postData)
                        .expect(status.CREATED)
                        .end((err, res: SuperTestResponse<CreatePreferenceResponseDto>) => {
                            if (err) { return done(err); }
                            const registration = res.body.registration;
                            expect(registration.preferences).to.have.length(1);
                            const preferences = registration.preferences;
                            expect(preferences[0].badge_id).to.exist;
                            expect(preferences[0].offering_id).to.equal(postData[0].offering);
                            expect(preferences[0].details.rank).to.equal(postData[0].rank);
                            return cb();
                        });
                }
            ], done);
        });

        it('should not create with an invalid offering', (done) => {
            const postData: CreatePreferenceRequestDto[] = [{
                offering: 30,
                rank: 1
            }];

            request.post('/api/scouts/' + generatedScouts[0].id + '/registrations/' + registrationIds[0] + '/preferences')
                .set('Authorization', generatedUsers.coordinator.token)
                .send(postData)
                .expect(status.BAD_REQUEST, done);
        });

        it('should not create with an invalid rank', (done) => {
            const postData: CreatePreferenceRequestDto[] = [{
                offering: generatedOfferings[0].id,
                rank: 30
            }];

            request.post('/api/scouts/' + generatedScouts[0].id + '/registrations/' + registrationIds[0] + '/preferences')
                .set('Authorization', generatedUsers.coordinator.token)
                .send(postData)
                .expect(status.BAD_REQUEST, done);
        });
    });
});
