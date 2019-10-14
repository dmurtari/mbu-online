
import supertest from 'supertest';
import * as async from 'async';
import status from 'http-status-codes';
import { expect } from 'chai';

import app from '@app/app';
import TestUtils, { RoleTokenObjects } from './testUtils';
import { Event } from '@models/event.model';
import { Scout } from '@models/scout.model';
import { UserRole } from '@interfaces/user.interface';
import { Registration } from '@models/registration.model';
import testScouts from './testScouts';
import { RegistrationRequestDto, CreateRegistrationResponseDto, RegistrationsResponseDto } from '@interfaces/registration.interface';
import { SuperTestResponse } from '@test/helpers/supertest.interface';
import { ScoutRegistrationResponseDto } from '@interfaces/scout.interface';
import { EventStatisticsDto } from '@interfaces/event.interface';

const request = supertest(app);

describe('registration', () => {
    let events: Event[];
    let generatedUsers: RoleTokenObjects;
    let generatedScouts: Scout[];

    const badId = TestUtils.badId;

    beforeAll(async () => {
        await TestUtils.dropDb();
    });

    beforeAll(async () => {
        generatedUsers = await TestUtils.generateTokens([
            UserRole.ADMIN,
            UserRole.TEACHER,
            UserRole.COORDINATOR,
            'coordinator2' as any
        ]);
    });

    beforeEach(async () => {
        await TestUtils.dropTable([Registration, Event, Scout]);

        events = await TestUtils.createEvents();
        generatedScouts = await TestUtils.createScoutsForUser(generatedUsers.coordinator, testScouts(5));
    });

    afterAll(async () => {
        await TestUtils.dropDb();
        await TestUtils.closeDb();
    });

    describe('registering a scout for an event', () => {
        test('should create the registration', (done) => {
            request.post('/api/scouts/' + generatedScouts[3].id + '/registrations')
                .set('Authorization', generatedUsers.coordinator.token)
                .send(<RegistrationRequestDto>{
                    event_id: events[0].id
                })
                .expect(status.CREATED)
                .end((err, res: SuperTestResponse<CreateRegistrationResponseDto>) => {
                    if (err) { return done(err); }
                    const registration = res.body.registration;
                    expect(registration.scout_id).to.equal(generatedScouts[3].id);
                    expect(registration.event_id).to.equal(events[0].id);
                    return done();
                });
        });

        test('should create a registration with a note', (done) => {
            const note = 'This is a note';

            request.post('/api/scouts/' + generatedScouts[3].id + '/registrations')
                .set('Authorization', generatedUsers.coordinator.token)
                .send(<RegistrationRequestDto>{
                    event_id: events[0].id,
                    notes: note
                })
                .expect(status.CREATED)
                .end((err, res: SuperTestResponse<CreateRegistrationResponseDto>) => {
                    if (err) { return done(err); }
                    const registration = res.body.registration;
                    expect(registration.scout_id).to.equal(generatedScouts[3].id);
                    expect(registration.event_id).to.equal(events[0].id);
                    expect(registration.notes).to.equal(note);
                    return done();
                });
        });

        test('should check for the correct owner', (done) => {
            request.post('/api/scouts/' + generatedScouts[3].id + '/registrations')
                .set('Authorization', generatedUsers.coordinator2.token)
                .send(<RegistrationRequestDto>{
                    event_id: events[0].id
                })
                .expect(status.UNAUTHORIZED, done);
        });

        test('should allow admins to register', (done) => {
            request.post('/api/scouts/' + generatedScouts[3].id + '/registrations')
                .set('Authorization', generatedUsers.admin.token)
                .send(<RegistrationRequestDto>{
                    event_id: events[0].id
                })
                .expect(status.CREATED, done);
        });

        test('should allow teachers to register', (done) => {
            request.post('/api/scouts/' + generatedScouts[3].id + '/registrations')
                .set('Authorization', generatedUsers.teacher.token)
                .send(<RegistrationRequestDto>{
                    event_id: events[0].id
                })
                .expect(status.CREATED, done);
        });

        test('should not create a registration for a nonexistant scout', (done) => {
            request.post('/api/scouts/' + badId + '/registrations')
                .set('Authorization', generatedUsers.coordinator.token)
                .send(<RegistrationRequestDto>{
                    event_id: events[0].id
                })
                .expect(status.BAD_REQUEST, done);
        });

        test('should not create a registration for a nonexistant event', (done) => {
            request.post('/api/scouts/' + generatedScouts[3].id + '/registrations')
                .set('Authorization', generatedUsers.coordinator.token)
                .send(<RegistrationRequestDto>{
                    event_id: badId
                })
                .expect(status.BAD_REQUEST, done);
        });

        test('should not create duplicate registrations', (done) => {
            async.series([
                (cb) => {
                    request.post('/api/scouts/' + generatedScouts[3].id + '/registrations')
                        .set('Authorization', generatedUsers.coordinator.token)
                        .send(<RegistrationRequestDto>{
                            event_id: events[0].id
                        })
                        .expect(status.CREATED, cb);
                },
                (cb) => {
                    request.post('/api/scouts/' + generatedScouts[3].id + '/registrations')
                        .set('Authorization', generatedUsers.coordinator.token)
                        .send(<RegistrationRequestDto>{
                            event_id: events[0].id
                        })
                        .expect(status.BAD_REQUEST, cb);
                }
            ], done);
        });
    });

    describe('when a scout is already registered for events', () => {
        let scoutId: string;

        beforeEach((done) => {
            scoutId = generatedScouts[3].id;
            async.series([
                (cb) => {
                    request.post('/api/scouts/' + generatedScouts[1].id + '/registrations')
                        .set('Authorization', generatedUsers.coordinator.token)
                        .send(<RegistrationRequestDto>{
                            event_id: events[0].id
                        })
                        .expect(status.CREATED, cb);
                },
                (cb) => {
                    request.post('/api/scouts/' + generatedScouts[1].id + '/registrations')
                        .set('Authorization', generatedUsers.coordinator.token)
                        .send(<RegistrationRequestDto>{
                            event_id: events[1].id
                        })
                        .expect(status.CREATED, cb);
                },
                (cb) => {
                    request.post('/api/scouts/' + scoutId + '/registrations')
                        .set('Authorization', generatedUsers.coordinator.token)
                        .send(<RegistrationRequestDto>{
                            event_id: events[0].id
                        })
                        .expect(status.CREATED, cb);
                },
                (cb) => {
                    request.post('/api/scouts/' + scoutId + '/registrations')
                        .set('Authorization', generatedUsers.coordinator.token)
                        .send(<RegistrationRequestDto>{
                            event_id: events[1].id
                        })
                        .expect(status.CREATED, cb);
                },
                (cb) => {
                    request.post('/api/scouts/' + generatedScouts[2].id + '/registrations')
                        .set('Authorization', generatedUsers.coordinator.token)
                        .send(<RegistrationRequestDto>{
                            event_id: events[0].id
                        })
                        .expect(status.CREATED, cb);
                }
            ], done);
        });

        describe('getting a scouts registrations', () => {
            test('should get all associated registrations', (done) => {
                request.get('/api/scouts/' + scoutId + '/registrations')
                    .set('Authorization', generatedUsers.coordinator.token)
                    .expect(status.OK)
                    .end((err, res: SuperTestResponse<RegistrationsResponseDto>) => {
                        if (err) { return done(err); }
                        const registrations = res.body;
                        expect(registrations).to.have.lengthOf(2);
                        expect(registrations[0].event_id).to.equal(events[1].id);
                        expect(registrations[1].event_id).to.equal(events[0].id);

                        registrations.forEach((registration: any) => {
                            expect(registration.preferences).to.be.a('array');
                            expect(registration.purchases).to.be.a('array');
                            expect(registration.assignments).to.be.a('array');
                        });

                        return done();
                    });
            });
        });

        describe('deleting a registration', () => {

            test('should delete a single registration', (done) => {
                async.series([
                    (cb) => {
                        request.del('/api/scouts/' + scoutId + '/registrations/' + events[0].id)
                            .set('Authorization', generatedUsers.coordinator.token)
                            .expect(status.OK, cb);
                    },
                    (cb) => {
                        request.get('/api/scouts/' + scoutId + '/registrations')
                            .set('Authorization', generatedUsers.coordinator.token)
                            .expect(status.OK)
                            .end((err, res: SuperTestResponse<RegistrationsResponseDto>) => {
                                if (err) { return cb(err); }
                                const registrations = res.body;
                                expect(registrations).to.have.length(1);
                                expect(registrations[0].event_id).to.equal(events[1].id);
                                return cb();
                            });
                    }
                ], done);
            });

            test('should check for the correct owner', (done) => {
                request.del('/api/scouts/' + scoutId + '/registrations/' + events[0].id)
                    .set('Authorization', generatedUsers.coordinator2.token)
                    .expect(status.UNAUTHORIZED, done);
            });

            test('should allow teachers to delete', (done) => {
                request.del('/api/scouts/' + scoutId + '/registrations/' + events[0].id)
                    .set('Authorization', generatedUsers.teacher.token)
                    .expect(status.OK, done);
            });

            test('should allow admins to delete', (done) => {
                request.del('/api/scouts/' + scoutId + '/registrations/' + events[0].id)
                    .set('Authorization', generatedUsers.admin.token)
                    .expect(status.OK, done);
            });

            test('should not delete for an invalid scout', (done) => {
                request.del('/api/scouts/' + badId + '/registrations/' + events[0].id)
                    .set('Authorization', generatedUsers.coordinator.token)
                    .expect(status.BAD_REQUEST, done);
            });

            test('should handle invalid events', (done) => {
                request.del('/api/scouts/' + scoutId + '/registrations/' + badId)
                    .set('Authorization', generatedUsers.coordinator.token)
                    .expect(status.BAD_REQUEST, done);
            });
        });
    });

    describe('when multiple scouts are registered for an event', () => {
        let generatedScouts2: Scout[];

        beforeEach(async () => {
            generatedScouts2 = await TestUtils.createScoutsForUser(generatedUsers.coordinator2, testScouts(5));
        });

        beforeEach((done) => {
            async.forEachOfSeries(generatedScouts, (scout, index, cb) => {
                request.post('/api/scouts/' + scout.id + '/registrations')
                    .set('Authorization', generatedUsers.coordinator.token)
                    .send(<RegistrationRequestDto>{
                        event_id: events[0].id
                    })
                    .expect(status.CREATED, cb);
            }, (err) => {
                done(err);
            });
        });

        beforeEach((done) => {
            async.forEachOfSeries(generatedScouts, (scout, index, cb) => {
                request.post('/api/scouts/' + scout.id + '/registrations')
                    .set('Authorization', generatedUsers.coordinator.token)
                    .send(<RegistrationRequestDto>{
                        event_id: events[1].id
                    })
                    .expect(status.CREATED, cb);
            }, (err) => {
                done(err);
            });
        });

        beforeEach((done) => {
            async.forEachOfSeries(generatedScouts2, (scout, index, cb) => {
                request.post('/api/scouts/' + scout.id + '/registrations')
                    .set('Authorization', generatedUsers.coordinator2.token)
                    .send(<RegistrationRequestDto>{
                        event_id: events[0].id
                    })
                    .expect(status.CREATED, cb);
            }, (err) => {
                done(err);
            });
        });

        test('should get scout registrations for a user', (done) => {
            request.get('/api/users/' + generatedUsers.coordinator.profile.id + '/scouts/registrations')
                .set('Authorization', generatedUsers.coordinator.token)
                .expect(status.OK)
                .end((err, res: SuperTestResponse<ScoutRegistrationResponseDto>) => {
                    if (err) { return done(err); }
                    const scouts = res.body;
                    expect(scouts).to.have.lengthOf(5);
                    scouts.forEach((scout) => {
                        expect(scout.registrations).to.have.lengthOf(2);
                        expect(scout.registrations[0].event_id).to.equal(events[0].id);
                        expect(scout.registrations[1].event_id).to.equal(events[1].id);
                    });
                    return done();
                });
        });

        test('should get registrations for an event for a user', (done) => {
            request.get('/api/users/' + generatedUsers.coordinator.profile.id + '/events/' + events[0].id + '/registrations')
                .set('Authorization', generatedUsers.coordinator.token)
                .expect(status.OK)
                .end((err, res: SuperTestResponse<RegistrationsResponseDto[]>) => {
                    if (err) { return done(err); }
                    const registrations = res.body;
                    expect(registrations).to.have.lengthOf(5);
                    registrations.forEach((registration: any, index: number) => {
                        expect(registration.event_id).to.equal(events[0].id);
                        expect(registration.scout_id).to.equal(generatedScouts[index].id);
                        expect(registration.scout.fullname).to.equal(generatedScouts[index].fullname);
                        expect(registration.preferences).to.be.a('array');
                        expect(registration.assignments).to.be.a('array');
                        expect(registration.purchases).to.be.a('array');
                    });
                    return done();
                });
        });

        test('should get registrations for another event for a user', (done) => {
            request.get('/api/users/' + generatedUsers.coordinator.profile.id + '/events/' + events[1].id + '/registrations')
                .set('Authorization', generatedUsers.coordinator.token)
                .expect(status.OK)
                .end((err, res: SuperTestResponse<RegistrationsResponseDto[]>) => {
                    if (err) { return done(err); }
                    const registrations = res.body;
                    expect(registrations).to.have.lengthOf(5);
                    registrations.forEach((registration: any, index: number) => {
                        expect(registration.event_id).to.equal(events[1].id);
                        expect(registration.scout_id).to.equal(generatedScouts[index].id);
                        expect(registration.scout.fullname).to.equal(generatedScouts[index].fullname);
                        expect(registration.preferences).to.be.a('array');
                        expect(registration.assignments).to.be.a('array');
                        expect(registration.purchases).to.be.a('array');
                    });
                    return done();
                });
        });

        test('should get registrations for an event for another user', (done) => {
            request.get('/api/users/' + generatedUsers.coordinator2.profile.id + '/events/' + events[0].id + '/registrations')
                .set('Authorization', generatedUsers.coordinator2.token)
                .expect(status.OK)
                .end((err, res: SuperTestResponse<RegistrationsResponseDto[]>) => {
                    if (err) { return done(err); }
                    const registrations = res.body;
                    expect(registrations).to.have.lengthOf(5);
                    registrations.forEach((registration: any, index: number) => {
                        expect(registration.event_id).to.equal(events[0].id);
                        expect(registration.scout_id).to.equal(generatedScouts2[index].id);
                        expect(registration.scout.fullname).to.equal(generatedScouts2[index].fullname);
                        expect(registration.preferences).to.be.a('array');
                        expect(registration.assignments).to.be.a('array');
                        expect(registration.purchases).to.be.a('array');
                    });
                    return done();
                });
        });

        test('should allow admins to see scout registrations for a user', (done) => {
            request.get('/api/users/' + generatedUsers.coordinator.profile.id + '/scouts/registrations')
                .set('Authorization', generatedUsers.admin.token)
                .expect(status.OK, done);
        });

        test('should allow teachers to see scout registrations for a user', (done) => {
            request.get('/api/users/' + generatedUsers.coordinator.profile.id + '/scouts/registrations')
                .set('Authorization', generatedUsers.teacher.token)
                .expect(status.OK, done);
        });

        test('should not allow other coordinators to see scout registrations for a user', (done) => {
            request.get('/api/users/' + generatedUsers.coordinator.profile.id + '/scouts/registrations')
                .set('Authorization', generatedUsers.coordinator2.token)
                .expect(status.UNAUTHORIZED, done);
        });

        test('should get registrations and offerings as parts of the event stats', (done) => {
            request.get('/api/events/' + events[0].id + '/stats')
                .set('Authorization', generatedUsers.admin.token)
                .expect(status.OK)
                .end((err, res: SuperTestResponse<EventStatisticsDto>) => {
                    if (err) { return done(err) }
                    const stats = res.body;
                    expect(stats.registrations).to.have.length(10);
                    expect(stats.scouts).to.have.length(10);
                    expect(stats.offerings).to.have.length(0);
                    return done();
                });
        });
    });
});
