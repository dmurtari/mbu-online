import supertest from 'supertest';
import * as async from 'async';
import status from 'http-status-codes';
import { expect } from 'chai';

import app from '@app/app';
import TestUtils, { RoleTokenObjects } from './testUtils';
import { Event } from '@models/event.model';
import { Purchasable } from '@models/purchasable.model';
import { Scout } from '@models/scout.model';
import { Badge } from '@models/badge.model';
import { Offering } from '@models/offering.model';
import { UserRole } from '@interfaces/user.interface';
import { OfferingInterface } from '@interfaces/offering.interface';
import testScouts from './testScouts';
import { CreatePreferenceRequestDto, CreatePreferenceResponseDto, PreferenceInterface } from '@interfaces/preference.interface';
import { CreateAssignmentRequestDto } from '@interfaces/assignment.interface';
import { CreateRegistrationResponseDto, RegistrationRequestDto, RegistrationsResponseDto } from '@interfaces/registration.interface';
import { SuperTestResponse } from '@test/helpers/supertest.interface';
import { CreatePurchaseRequestDto } from '@interfaces/purchase.interface';
import { ScoutsResponseDto, ScoutDto } from '@interfaces/scout.interface';
import { AssigneesResponseDto } from '@interfaces/event.interface';

const request = supertest(app);

describe('using preference and assignments', () => {
    let events: Event[];
    let purchasables: Purchasable[];
    let generatedUsers: RoleTokenObjects;
    let generatedScouts: Scout[];
    let generatedBadges: Badge[];
    let generatedOfferings: Offering[];
    let preferences: { [key: string]: PreferenceInterface[]};

    const badId = TestUtils.badId;

    beforeAll(async () => {
        await TestUtils.dropDb();
    });

    beforeAll(async () => {
        const defaultPostData: OfferingInterface = {
        price: 10,
            periods: [1, 2, 3],
            duration: 1
        };

        generatedUsers = await TestUtils.generateTokens([
            UserRole.ADMIN,
            UserRole.TEACHER,
            UserRole.COORDINATOR,
            'coordinator2' as any
        ]);

        preferences = {};
        events = await TestUtils.createEvents();
        generatedBadges = await TestUtils.createBadges();
        generatedOfferings = await TestUtils.createOfferingsForEvent(events[0], generatedBadges, defaultPostData);
        generatedScouts = await TestUtils.createScoutsForUser(generatedUsers.coordinator, testScouts(5));
        await TestUtils.createScoutsForUser(generatedUsers.coordinator2, testScouts(5));
        purchasables = await TestUtils.createPurchasablesForEvent(events[0]);
    });

    beforeAll((done) => {
        const postData: CreatePreferenceRequestDto[] = [{
            offering: generatedOfferings[0].id,
            rank: 1
        }, {
            offering: generatedOfferings[1].id,
            rank: 2
        }];

        async.forEachOfSeries(generatedScouts, (scout, index, cb) => {
            let registrationId: number;

            async.series([
                (next) => {
                    request.post('/api/scouts/' + scout.id + '/registrations')
                        .set('Authorization', generatedUsers.coordinator.token)
                        .send(<RegistrationRequestDto>{ event_id: events[0].id })
                        .expect(status.CREATED)
                        .end((err, res: SuperTestResponse<CreateRegistrationResponseDto>) => {
                            if (err) { return done(err); }
                            registrationId = res.body.registration.id;
                            return next();
                        });
                },
                (next) => {
                    request.post('/api/scouts/' + scout.id + '/registrations/' + registrationId + '/purchases')
                        .set('Authorization', generatedUsers.coordinator.token)
                        .send(<CreatePurchaseRequestDto>{
                            purchasable: purchasables[0].id,
                            quantity: 2,
                            size: 'l'
                        })
                        .expect(status.CREATED, next);
                },
                (next) => {
                    request.post('/api/scouts/' + scout.id + '/registrations/' + registrationId + '/preferences')
                        .set('Authorization', generatedUsers.admin.token)
                        .send(postData)
                        .expect(status.CREATED)
                        .end((err, res: SuperTestResponse<CreatePreferenceResponseDto>) => {
                            if (err) { return done(err); }
                            preferences[registrationId] = res.body.registration.preferences;
                            return next();
                        });
                },
                (next) => {
                    const assignmentPost: CreateAssignmentRequestDto[] = [{
                        periods: [1],
                        offering: generatedOfferings[0].id
                    }, {
                        periods: [2],
                        offering: generatedOfferings[1].id
                    }, {
                        periods: [3],
                        offering: generatedOfferings[2].id
                    }];

                    request.post('/api/scouts/' + scout.id + '/registrations/' + registrationId + '/assignments')
                        .set('Authorization', generatedUsers.admin.token)
                        .send(assignmentPost)
                        .expect(status.CREATED, next);
                }
            ], cb);
        }, done);
    });

    afterAll(async () => {
        await TestUtils.dropDb();
        await TestUtils.closeDb();
    });

    describe('getting scouts that are registered for an event', () => {

        test('should get all registrations for an event', (done) => {
            request.get('/api/events/' + events[0].id + '/registrations')
                .set('Authorization', generatedUsers.admin.token)
                .expect(status.OK)
                .end((err, res: SuperTestResponse<RegistrationsResponseDto>) => {
                    if (err) { return done(err); }
                    res.body.forEach((registration) => {
                        expect(registration.scout_id).to.exist;
                        expect(registration.scout).to.exist;
                        expect(registration.scout.firstname).to.exist;
                        expect(registration.scout.lastname).to.exist;
                        expect(registration.scout.troop).to.exist;
                        expect(registration.preferences).to.have.lengthOf(2);
                        expect(registration.assignments).to.have.lengthOf(3);
                        expect(registration.purchases).to.have.lengthOf(1);

                        registration.preferences.forEach((preference) => {
                            expect(preference.badge.name).to.exist;
                            expect(preference.details.rank).to.exist;
                        });

                        registration.purchases.forEach((purchase) => {
                            expect(purchase.item).to.exist;
                            expect(purchase.price).to.exist;
                            expect(purchase.details.quantity).to.exist;
                            expect(purchase.details.size).to.exist;
                        });

                        registration.assignments.forEach((assignment) => {
                            expect(assignment.badge.name).to.exist;
                            expect(assignment.details.periods).to.exist;
                            expect(assignment.details.completions).to.exist;
                            expect(assignment.price).to.exist;
                        });
                    });
                    return done();
                });
        });

        test('should allow teachers to see registrations', (done) => {
            request.get('/api/events/' + events[0].id + '/registrations')
                .set('Authorization', generatedUsers.teacher.token)
                .expect(status.OK, done);
        });

        test('should not allow coordinators to see registrations', (done) => {
            request.get('/api/events/' + events[0].id + '/registrations')
                .set('Authorization', generatedUsers.coordinator.token)
                .expect(status.UNAUTHORIZED, done);
        });

        test('should fail gracefully for a bad id', (done) => {
            request.get('/api/events/' + badId + '/registrations')
                .set('Authorization', generatedUsers.teacher.token)
                .expect(status.OK, done);
        });
    });

    describe('getting all scouts and all registrations', () => {
        test('should get all scouts of the site', (done) => {
            request.get('/api/scouts')
                .set('Authorization', generatedUsers.admin.token)
                .expect(status.OK)
                .end((err, res: SuperTestResponse<ScoutsResponseDto>) => {
                    if (err) { return done(err); }
                    const scouts = res.body;
                    expect(scouts).to.have.lengthOf(10);
                    scouts.forEach((scout) => {
                        expect(scout.firstname).to.exist;
                        expect(scout.lastname).to.exist;
                        expect(scout.troop).to.exist;
                        expect(scout.emergency_name).to.exist;
                        expect(scout.emergency_phone).to.exist;
                        expect(scout.emergency_relation).to.exist;
                        expect(scout.notes).to.exist;
                        expect(scout.registrations).to.exist;
                        expect(scout.user).to.exist;
                    });
                    return done();
                });
        });

        test('should allow teachers to get a list of scouts', (done) => {
            request.get('/api/scouts')
                .set('Authorization', generatedUsers.teacher.token)
                .expect(status.OK, done);
        });

        test('should get some details of the registration', (done) => {
            request.get('/api/scouts')
                .set('Authorization', generatedUsers.admin.token)
                .expect(status.OK)
                .end((err, res: SuperTestResponse<ScoutsResponseDto>) => {
                    if (err) { return done(err); }
                    const scouts = res.body;
                    expect(scouts).to.have.lengthOf(10);
                    scouts.forEach((scout) => {
                        scout.registrations.forEach((registration) => {
                            expect(registration.details.id).to.exist;
                            expect(registration.event_id).to.exist;
                            expect(registration.year).to.exist;
                            expect(registration.semester).to.exist;
                        });
                    });
                    return done();
                });
        });

        test('should get some details of the user', (done) => {
            request.get('/api/scouts')
                .set('Authorization', generatedUsers.admin.token)
                .expect(status.OK)
                .end((err, res: SuperTestResponse<ScoutsResponseDto>) => {
                    if (err) { return done(err); }
                    const scouts = res.body;
                    expect(scouts).to.have.lengthOf(10);
                    scouts.forEach((scout) => {
                        expect(scout.user.fullname).to.exist;
                        expect(scout.user.email).to.exist;
                        expect(scout.user.user_id).to.exist;
                    });
                    return done();
                });
        });

        test('should not allow coordinators to access', (done) => {
            request.get('/api/scouts')
                .set('Authorization', generatedUsers.coordinator.token)
                .expect(status.UNAUTHORIZED, done);
        });

        test('should also get details for a single scout', (done) => {
            request.get('/api/scouts/' + generatedScouts[0].id)
                .set('Authorization', generatedUsers.admin.token)
                .expect(status.OK)
                .end((err, res: SuperTestResponse<ScoutDto>) => {
                    if (err) { return done(err); }
                    const scout = res.body;
                    expect(scout.scout_id).to.equal(generatedScouts[0].id);
                    expect(scout.registrations).to.have.lengthOf(1);
                    expect(scout.user).to.exist;
                    return done();
                });
        });

    });

    describe('getting scouts that are assigned to a class', () => {
        test('should get all assignees for an event', (done) => {
            request.get('/api/events/' + events[0].id + '/offerings/assignees')
                .set('Authorization', generatedUsers.admin.token)
                .expect(status.OK)
                .end((err, res: SuperTestResponse<AssigneesResponseDto>) => {
                    if (err) { return done(err); }
                    const offerings = res.body;
                    expect(offerings).to.have.lengthOf(3);
                    offerings.forEach((offering) => {
                        expect(offering.badge.name).to.exist;
                        expect(offering.assignees).to.have.lengthOf(5);
                        offering.assignees.forEach((assignee) => {
                            expect(assignee.scout.fullname).to.exist;
                            expect(assignee.scout.troop).to.exist;
                            expect(assignee.assignment.periods).to.exist;
                            expect(assignee.assignment.completions).to.exist;
                        });
                    });

                    return done();
                });
        });


        test('should allow teachers to access assignees', (done) => {
            request.get('/api/events/' + events[0].id + '/offerings/assignees')
                .set('Authorization', generatedUsers.teacher.token)
                .expect(status.OK, done);
        });

        test('should not allow coordinators to access assignees', (done) => {
            request.get('/api/events/' + events[0].id + '/offerings/assignees')
                .set('Authorization', generatedUsers.coordinator.token)
                .expect(status.UNAUTHORIZED, done);
        });
    });
});
