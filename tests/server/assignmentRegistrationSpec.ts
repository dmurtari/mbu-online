import supertest from 'supertest';
import * as async from 'async';
import status from 'http-status-codes';
import { expect } from 'chai';

import app from '@app/app';
import TestUtils, { RoleTokenObjects } from './testUtils';
import { Badge } from '@models/badge.model';
import { Event } from '@models/event.model';
import { Scout } from '@models/scout.model';
import { Offering } from '@models/offering.model';
import { Assignment } from '@models/assignment.model';
import { Registration } from '@models/registration.model';
import { UserRole } from '@interfaces/user.interface';
import { OfferingInterface } from '@interfaces/offering.interface';
import testScouts from './testScouts';

const request = supertest(app);

describe('Assignments and registrations', () => {
    let badges: Badge[];
    let events: Event[];
    let generatedUsers: RoleTokenObjects;
    let generatedTroop1: Scout[];
    let generatedTroop2: Scout[];
    let generatedOfferings: Offering[];
    let troop1Registrations: number[];
    let troop2Registrations: number[];

    before(async () => {
        await TestUtils.dropDb();
    });

    before(async () => {
        generatedUsers = await TestUtils.generateTokens([
            UserRole.ADMIN,
            UserRole.COORDINATOR,
            UserRole.TEACHER,
            'coordinator1' as any
        ]);
    });

    beforeEach(async () => {
        troop1Registrations = [];
        troop2Registrations = [];
        await TestUtils.dropTable([Event, Offering, Badge, Assignment, Registration, Scout]);
    });

    beforeEach(async () => {
        const defaultPostData: OfferingInterface = {
            price: 10,
            periods: [1, 2, 3],
            duration: 1,
            requirements: ['1', '2', '3']
        };

        badges = await TestUtils.createBadges();
        events = await TestUtils.createEvents();
        generatedOfferings = await TestUtils.createOfferingsForEvent(events[0], badges, defaultPostData);
        generatedTroop1 = await TestUtils.createScoutsForUser(generatedUsers.coordinator, testScouts(5));
        generatedTroop2 = await TestUtils.createScoutsForUser(generatedUsers.coordinator1, testScouts(5));
    });

    after(async () => {
        await TestUtils.dropDb();
    });

    describe('when a group of scouts has been registered', () => {
        beforeEach((done) => {
            async.forEachOfSeries(generatedTroop1, (scout, index, cb) => {
                request.post('/api/scouts/' + scout.id + '/registrations')
                    .set('Authorization', generatedUsers.coordinator.token)
                    .send({
                        event_id: events[0].id
                    })
                    .expect(status.CREATED)
                    .end((err, res) => {
                        if (err) { return done(err); }
                        troop1Registrations.push(res.body.registration.id);
                        return cb();
                    });
            }, (err) => {
                done(err);
            });
        });

        it('should contain the correct registrations', (done) => {
            request.get('/api/events/' + events[0].id + '/registrations')
                .set('Authorization', generatedUsers.admin.token)
                .expect(status.OK)
                .end((err, res) => {
                    if (err) { return done(err); }
                    expect(res.body).to.have.lengthOf(5);
                    return done();
                });
        });

        describe('and another group of scouts is registered', () => {
            beforeEach((done) => {
                async.forEachOfSeries(generatedTroop2, (scout, index, cb) => {
                    request.post('/api/scouts/' + scout.id + '/registrations')
                        .set('Authorization', generatedUsers.coordinator1.token)
                        .send({
                            event_id: events[0].id
                        })
                        .expect(status.CREATED)
                        .end((err, res) => {
                            if (err) { return done(err); }
                            troop2Registrations.push(res.body.registration.id);
                            return cb();
                        });
                }, (err) => {
                    done(err);
                });
            });

            it('should contain the correct registrations', (done) => {
                request.get('/api/events/' + events[0].id + '/registrations')
                    .set('Authorization', generatedUsers.admin.token)
                    .expect(status.OK)
                    .end((err, res) => {
                        if (err) { return done(err); }
                        expect(res.body).to.have.lengthOf(10);
                        return done();
                    });
            });

            describe('and a coordinator requests registration information', () => {
                beforeEach((done) => {
                    request.get('/api/users/' + generatedUsers.coordinator1.profile.id + '/events/' + events[0].id + '/registrations')
                        .set('Authorization', generatedUsers.coordinator1.token)
                        .expect(status.OK, done);
                });

                it('should contain the correct registrations', (done) => {
                    request.get('/api/events/' + events[0].id + '/registrations')
                        .set('Authorization', generatedUsers.admin.token)
                        .expect(status.OK)
                        .end((err, res) => {
                            if (err) { return done(err); }
                            expect(res.body).to.have.lengthOf(10);
                            return done();
                        });
                });
            });
        });

        describe('and they have been assigned to classes', () => {
            beforeEach((done) => {
                async.forEachOfSeries(generatedTroop1, (scout, index: number, cb) => {
                    request.post('/api/scouts/' + scout.id + '/registrations/' +
                        troop1Registrations[index] + '/assignments')
                        .set('Authorization', generatedUsers.teacher.token)
                        .send({
                            offering: generatedOfferings[0].id,
                            periods: [1]
                        })
                        .expect(status.CREATED, cb);
                }, (err) => {
                    done(err);
                });
            });

            it('should contain the correct registrations', (done) => {
                request.get('/api/events/' + events[0].id + '/registrations')
                    .set('Authorization', generatedUsers.admin.token)
                    .expect(status.OK)
                    .end((err, res) => {
                        if (err) { return done(err); }
                        expect(res.body).to.have.lengthOf(5);
                        return done();
                    });
            });

            describe('and another group of scouts is registered', () => {
                beforeEach((done) => {
                    async.forEachOfSeries(generatedTroop2, (scout, index, cb) => {
                        request.post('/api/scouts/' + scout.id + '/registrations')
                            .set('Authorization', generatedUsers.coordinator1.token)
                            .send({
                                event_id: events[0].id
                            })
                            .expect(status.CREATED)
                            .end((err, res) => {
                                if (err) { return done(err); }
                                troop2Registrations.push(res.body.registration.id);
                                return cb();
                            });
                    }, (err) => {
                        done(err);
                    });
                });

                it('should contain the correct registrations', (done) => {
                    request.get('/api/events/' + events[0].id + '/registrations')
                        .set('Authorization', generatedUsers.admin.token)
                        .expect(status.OK)
                        .end((err, res) => {
                            if (err) { return done(err); }
                            expect(res.body).to.have.lengthOf(10);
                            return done();
                        });
                });
            });
        });
    });
});

