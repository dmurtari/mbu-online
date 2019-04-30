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
import { Preference } from '@models/preference.model';
import { UserRole } from '@interfaces/user.interface';
import { OfferingInterface } from '@interfaces/offering.interface';
import testScouts from './testScouts';
import { PreferenceRequestInterface } from '@interfaces/preference.interface';
import { AssignmentRequestInterface } from '@interfaces/assignment.interface';

const request = supertest(app);

describe.only('using preference and assignments', () => {
    let events: Event[];
    let purchasables: Purchasable[];
    let generatedUsers: RoleTokenObjects;
    let generatedScouts: Scout[];
    let generatedBadges: Badge[];
    let generatedOfferings: Offering[];
    let preferences: { [key: string]: Preference[]};

    const badId = TestUtils.badId;

    before(async () => {
        await TestUtils.dropDb();
    });

    before(async () => {
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

    before((done) => {
        const postData: PreferenceRequestInterface[] = [{
            offering: generatedOfferings[0].id,
            rank: 1
        }, {
            offering: generatedOfferings[1].id,
            rank: 2
        }];

        async.forEachOfSeries(generatedScouts, (scout, index, cb) => {
            let registrationId: string;

            async.series([
                (next) => {
                    request.post('/api/scouts/' + scout.id + '/registrations')
                        .set('Authorization', generatedUsers.coordinator.token)
                        .send({ event_id: events[0].id })
                        .expect(status.CREATED)
                        .end((err, res) => {
                            if (err) { return done(err); }
                            registrationId = res.body.registration.id;
                            return next();
                        });
                },
                (next) => {
                    request.post('/api/scouts/' + scout.id + '/registrations/' + registrationId + '/purchases')
                        .set('Authorization', generatedUsers.coordinator.token)
                        .send({
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
                        .end((err, res) => {
                            if (err) { return done(err); }
                            preferences[registrationId] = res.body.registration.preferences;
                            return next();
                        });
                },
                (next) => {
                    const assignmentPost: AssignmentRequestInterface[] = [{
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

    after(async () => {
        await TestUtils.dropDb();
    });

    describe('getting scouts that are registered for an event', () => {

        it('should get all registrations for an event', (done) => {
            request.get('/api/events/' + events[0].id + '/registrations')
                .set('Authorization', generatedUsers.admin.token)
                .expect(status.OK)
                .end((err, res) => {
                    if (err) { return done(err); }
                    res.body.forEach((registration: any) => {
                        expect(registration.scout_id).to.exist;
                        expect(registration.scout).to.exist;
                        expect(registration.scout.firstname).to.exist;
                        expect(registration.scout.lastname).to.exist;
                        expect(registration.scout.troop).to.exist;
                        expect(registration.preferences).to.have.lengthOf(2);
                        expect(registration.assignments).to.have.lengthOf(3);
                        expect(registration.purchases).to.have.lengthOf(1);

                        registration.preferences.forEach((preference: any) => {
                            expect(preference.badge.name).to.exist;
                            expect(preference.details.rank).to.exist;
                        });

                        registration.purchases.forEach((purchase: any) => {
                            expect(purchase.item).to.exist;
                            expect(purchase.price).to.exist;
                            expect(purchase.details.quantity).to.exist;
                            expect(purchase.details.size).to.exist;
                        });

                        registration.assignments.forEach((assignment: any) => {
                            expect(assignment.badge.name).to.exist;
                            expect(assignment.details.periods).to.exist;
                            expect(assignment.details.completions).to.exist;
                            expect(assignment.price).to.exist;
                        });
                    });
                    return done();
                });
        });

        it('should allow teachers to see registrations', (done) => {
            request.get('/api/events/' + events[0].id + '/registrations')
                .set('Authorization', generatedUsers.teacher.token)
                .expect(status.OK, done);
        });

        it('should not allow coordinators to see registrations', (done) => {
            request.get('/api/events/' + events[0].id + '/registrations')
                .set('Authorization', generatedUsers.coordinator.token)
                .expect(status.UNAUTHORIZED, done);
        });

        it('should fail gracefully for a bad id', (done) => {
            request.get('/api/events/' + badId + '/registrations')
                .set('Authorization', generatedUsers.teacher.token)
                .expect(status.OK, done);
        });
    });

    describe('getting all scouts and all registrations', () => {
        it('should get all scouts of the site', (done) => {
            request.get('/api/scouts')
                .set('Authorization', generatedUsers.admin.token)
                .expect(status.OK)
                .end((err, res) => {
                    if (err) { return done(err); }
                    const scouts = res.body;
                    expect(scouts).to.have.lengthOf(10);
                    scouts.forEach((scout: Scout) => {
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

        it('should allow teachers to get a list of scouts', (done) => {
            request.get('/api/scouts')
                .set('Authorization', generatedUsers.teacher.token)
                .expect(status.OK, done);
        });

        it('should get some details of the registration', (done) => {
            request.get('/api/scouts')
                .set('Authorization', generatedUsers.admin.token)
                .expect(status.OK)
                .end((err, res) => {
                    if (err) { return done(err); }
                    const scouts = res.body;
                    expect(scouts).to.have.lengthOf(10);
                    scouts.forEach((scout: any) => {
                        scout.registrations.forEach((registration: any) => {
                            expect(registration.details.id).to.exist;
                            expect(registration.event_id).to.exist;
                            expect(registration.year).to.exist;
                            expect(registration.semester).to.exist;
                        });
                    });
                    return done();
                });
        });

        it('should get some details of the user', (done) => {
            request.get('/api/scouts')
                .set('Authorization', generatedUsers.admin.token)
                .expect(status.OK)
                .end((err, res) => {
                    if (err) { return done(err); }
                    const scouts = res.body;
                    expect(scouts).to.have.lengthOf(10);
                    scouts.forEach((scout: any) => {
                        expect(scout.user.fullname).to.exist;
                        expect(scout.user.email).to.exist;
                        expect(scout.user.user_id).to.exist;
                    });
                    return done();
                });
        });

        it('should not allow coordinators to access', (done) => {
            request.get('/api/scouts')
                .set('Authorization', generatedUsers.coordinator.token)
                .expect(status.UNAUTHORIZED, done);
        });

        it('should also get details for a single scout', (done) => {
            request.get('/api/scouts/' + generatedScouts[0].id)
                .set('Authorization', generatedUsers.admin.token)
                .expect(status.OK)
                .end((err, res) => {
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
        it('should get all assignees for an event', (done) => {
            request.get('/api/events/' + events[0].id + '/offerings/assignees')
                .set('Authorization', generatedUsers.admin.token)
                .expect(status.OK)
                .end((err, res) => {
                    if (err) { return done(err); }
                    const offerings = res.body;
                    expect(offerings).to.have.lengthOf(3);
                    offerings.forEach((offering: any) => {
                        expect(offering.badge.name).to.exist;
                        expect(offering.assignees).to.have.lengthOf(5);
                        offering.assignees.forEach((assignee: any) => {
                            expect(assignee.scout.fullname).to.exist;
                            expect(assignee.scout.troop).to.exist;
                            expect(assignee.assignment.periods).to.exist;
                            expect(assignee.assignment.completions).to.exist;
                        });
                    });

                    return done();
                });
        });


        it('should allow teachers to access assignees', (done) => {
            request.get('/api/events/' + events[0].id + '/offerings/assignees')
                .set('Authorization', generatedUsers.teacher.token)
                .expect(status.OK, done);
        });

        it('should not allow coordinators to access assignees', (done) => {
            request.get('/api/events/' + events[0].id + '/offerings/assignees')
                .set('Authorization', generatedUsers.coordinator.token)
                .expect(status.UNAUTHORIZED, done);
        });
    });
});
