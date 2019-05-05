import supertest from 'supertest';
import * as async from 'async';
import status from 'http-status-codes';
import { expect } from 'chai';

import app from '@app/app';
import TestUtils, { RoleTokenObjects } from './testUtils';
import { Scout } from '@models/scout.model';
import { Event } from '@models/event.model';
import { Badge } from '@models/badge.model';
import testScouts from './testScouts';
import { ScoutInterface } from '@interfaces/scout.interface';
import { UserRole } from '@interfaces/user.interface';

const request = supertest(app);

describe.only('payments', () => {
    let generatedUsers: RoleTokenObjects;
    let generatedTroop1: Scout[];
    let generatedTroop2: Scout[];
    let generatedEvents: Event[];
    let generatedBadges: Badge[];
    let offeringIds: number[];
    let purchasableIds: number[];
    let registrationIds: number[];

    const badgeCost: string = '10.00';
    const tShirtCost: string = '9.25';
    const lunchCost: string = '12.00';
    const scoutsGroup1: ScoutInterface[] = testScouts(2);
    const scoutsGroup2: ScoutInterface[] = testScouts(2);

    beforeEach(async () => {
        await TestUtils.dropDb();

        generatedUsers = await TestUtils.generateTokens([UserRole.ADMIN, UserRole.TEACHER, UserRole.COORDINATOR, 'coordinator2' as any]);
        generatedEvents = await TestUtils.createEvents();
        generatedBadges = await TestUtils.createBadges();

        generatedTroop1 = await TestUtils.createScoutsForUser(generatedUsers.coordinator, scoutsGroup1);
        generatedTroop2 = await TestUtils.createScoutsForUser(generatedUsers.coordinator2, scoutsGroup2);
    });

    beforeEach(() => {
        offeringIds = [];
        purchasableIds = [];
        registrationIds = [];
    });

    beforeEach((done) => {
        async.series([
            // Create offerings for an event
            (cb) => {
                request.post('/api/events/' + generatedEvents[0].id + '/badges')
                    .set('Authorization', generatedUsers.admin.token)
                    .send({
                        badge_id: generatedBadges[0].id,
                        offering: {
                            duration: 1,
                            periods: [1, 2, 3],
                            price: badgeCost
                        }
                    })
                    .expect(status.CREATED)
                    .end((err, res) => {
                        if (err) { return cb(err); }
                        offeringIds.push(res.body.event.offerings[0].details.id);
                        return cb();
                    });
            },
            (cb) => {
                request.post('/api/events/' + generatedEvents[0].id + '/badges')
                    .set('Authorization', generatedUsers.admin.token)
                    .send({
                        badge_id: generatedBadges[1].id,
                        offering: {
                            duration: 2,
                            periods: [2, 3]
                        }
                    })
                    .expect(status.CREATED)
                    .end((err, res) => {
                        if (err) { return cb(err); }
                        offeringIds.push(res.body.event.offerings[1].details.id);
                        return cb();
                    });
            },
            (cb) => {
                request.post('/api/events/' + generatedEvents[1].id + '/badges')
                    .set('Authorization', generatedUsers.admin.token)
                    .send({
                        badge_id: generatedBadges[1].id,
                        offering: {
                            duration: 2,
                            periods: [2, 3],
                            price: badgeCost
                        }
                    })
                    .expect(status.CREATED)
                    .end((err, res) => {
                        if (err) { return cb(err); }
                        offeringIds.push(res.body.event.offerings[0].details.id);
                        return cb();
                    });
            },
            // Create purchasable items for an event
            (cb) => {
                request.post('/api/events/' + generatedEvents[0].id + '/purchasables')
                    .set('Authorization', generatedUsers.admin.token)
                    .send({
                        item: 'T-Shirt',
                        price: tShirtCost
                    })
                    .expect(status.CREATED)
                    .end((err, res) => {
                        if (err) { return cb(err); }
                        purchasableIds.push(res.body.purchasables[0].id);
                        return cb();
                    });
            },
            (cb) => {
                request.post('/api/events/' + generatedEvents[0].id + '/purchasables')
                    .set('Authorization', generatedUsers.admin.token)
                    .send({
                        item: 'Lunch',
                        price: lunchCost
                    })
                    .expect(status.CREATED)
                    .end((err, res) => {
                        if (err) { return cb(err); }
                        purchasableIds.push(res.body.purchasables[1].id);
                        return cb();
                    });
            },
            // Register scout for an event
            (cb) => {
                request.post('/api/scouts/' + generatedTroop1[0].id + '/registrations')
                    .set('Authorization', generatedUsers.coordinator.token)
                    .send({
                        event_id: generatedEvents[0].id
                    })
                    .expect(status.CREATED)
                    .end((err, res) => {
                        if (err) { return cb(err); }
                        registrationIds.push(res.body.registration.id);
                        return cb();
                    });
            },
            // Create preferences for a registration
            (cb) => {
                request.post('/api/scouts/' + generatedTroop1[0].id + '/registrations/' + registrationIds[0] + '/preferences')
                    .set('Authorization', generatedUsers.coordinator.token)
                    .send({
                        offering: offeringIds[1],
                        rank: 1
                    })
                    .expect(status.CREATED, cb);
            },
            (cb) => {
                request.post('/api/scouts/' + generatedTroop1[0].id + '/registrations/' + registrationIds[0] + '/preferences')
                    .set('Authorization', generatedUsers.coordinator.token)
                    .send({
                        offering: offeringIds[0],
                        rank: 2
                    })
                    .expect(status.CREATED, cb);
            },
            (cb) => {
                request.post('/api/scouts/' + generatedTroop1[0].id + '/registrations/' + registrationIds[0] + '/purchases')
                    .set('Authorization', generatedUsers.coordinator.token)
                    .send({
                        // T-Shirt
                        purchasable: purchasableIds[0],
                        quantity: 3
                    })
                    .expect(status.CREATED, cb);
            },
            (cb) => {
                request.post('/api/scouts/' + generatedTroop1[0].id + '/registrations/' + registrationIds[0] + '/purchases')
                    .set('Authorization', generatedUsers.coordinator.token)
                    .send({
                        // Lunch
                        purchasable: purchasableIds[1],
                        quantity: 1
                    })
                    .expect(status.CREATED, cb);
            },
            // Register another scout for an event
            (cb) => {
                request.post('/api/scouts/' + generatedTroop1[1].id + '/registrations')
                    .set('Authorization', generatedUsers.coordinator.token)
                    .send({
                        event_id: generatedEvents[0].id
                    })
                    .expect(status.CREATED)
                    .end((err, res) => {
                        if (err) { return cb(err); }
                        registrationIds.push(res.body.registration.id);
                        return cb();
                    });
            },
            // Create preferences for a registration
            (cb) => {
                request.post('/api/scouts/' + generatedTroop1[1].id + '/registrations/' + registrationIds[1] + '/preferences')
                    .set('Authorization', generatedUsers.coordinator.token)
                    .send({
                        offering: offeringIds[1],
                        rank: 1
                    })
                    .expect(status.CREATED, cb);
            },
            (cb) => {
                request.post('/api/scouts/' + generatedTroop1[1].id + '/registrations/' + registrationIds[1] + '/preferences')
                    .set('Authorization', generatedUsers.coordinator.token)
                    .send({
                        offering: offeringIds[0],
                        rank: 2
                    })
                    .expect(status.CREATED, cb);
            },
            (cb) => {
                request.post('/api/scouts/' + generatedTroop1[1].id + '/registrations/' + registrationIds[1] + '/purchases')
                    .set('Authorization', generatedUsers.coordinator.token)
                    .send({
                        // T-Shirt
                        purchasable: purchasableIds[0],
                        quantity: 1
                    })
                    .expect(status.CREATED, cb);
            },
            (cb) => {
                request.post('/api/scouts/' + generatedTroop1[1].id + '/registrations/' + registrationIds[1] + '/purchases')
                    .set('Authorization', generatedUsers.coordinator.token)
                    .send({
                        // Lunch
                        purchasable: purchasableIds[1],
                        quantity: 3
                    })
                    .expect(status.CREATED, cb);
            },
            // Register the same scout for a different event
            (cb) => {
                request.post('/api/scouts/' + generatedTroop1[1].id + '/registrations')
                    .set('Authorization', generatedUsers.coordinator.token)
                    .send({
                        event_id: generatedEvents[1].id
                    })
                    .expect(status.CREATED)
                    .end((err, res) => {
                        if (err) { return cb(err); }
                        registrationIds.push(res.body.registration.id);
                        return cb();
                    });
            },
            (cb) => {
                request.post('/api/scouts/' + generatedTroop1[1].id + '/registrations/' + registrationIds[2] + '/preferences')
                    .set('Authorization', generatedUsers.coordinator.token)
                    .send({
                        offering: offeringIds[2],
                        rank: 1
                    })
                    .expect(status.CREATED, cb);
            },
            // Register a scout from a different troop
            (cb) => {
                request.post('/api/scouts/' + generatedTroop2[1].id + '/registrations')
                    .set('Authorization', generatedUsers.coordinator2.token)
                    .send({
                        event_id: generatedEvents[0].id
                    })
                    .expect(status.CREATED)
                    .end((err, res) => {
                        if (err) { return cb(err); }
                        registrationIds.push(res.body.registration.id);
                        return cb();
                    });
            },
            (cb) => {
                request.post('/api/scouts/' + generatedTroop2[1].id + '/registrations/' + registrationIds[3] + '/preferences')
                    .set('Authorization', generatedUsers.coordinator2.token)
                    .send({
                        offering: offeringIds[2],
                        rank: 1
                    })
                    .expect(status.CREATED, cb);
            },
        ], done);
    });

    describe('calculating potential prices', () => {
        it('should calculate for an individual scout', (done) => {
            request.get('/api/scouts/' + generatedTroop1[0].id + '/registrations/' + registrationIds[0] + '/projectedCost')
                .set('Authorization', generatedUsers.coordinator.token)
                .expect(status.OK)
                .end((err, res) => {
                    if (err) { return done(err); }
                    expect(res.body.cost).to.equal('59.75');
                    return done();
                });
        });

        it('should calculate a different cost for another scout', (done) => {
            request.get('/api/scouts/' + generatedTroop1[1].id + '/registrations/' + registrationIds[1] + '/projectedCost')
                .set('Authorization', generatedUsers.coordinator.token)
                .expect(status.OK)
                .end((err, res) => {
                    if (err) { return done(err); }
                    expect(res.body.cost).to.equal('65.25');
                    return done();
                });
        });

        it('should calculate a different cost for another scout for another event', (done) => {
            request.get('/api/scouts/' + generatedTroop1[1].id + '/registrations/' + registrationIds[2] + '/projectedCost')
                .set('Authorization', generatedUsers.coordinator.token)
                .expect(status.OK)
                .end((err, res) => {
                    if (err) { return done(err); }
                    expect(res.body.cost).to.equal('20.00');
                    return done();
                });
        });

        it('should get the potential cost of attendance for a troop', (done) => {
            request.get('/api/users/' + generatedUsers.coordinator.profile.id + '/events/' + generatedEvents[0].id + '/projectedCost')
                .set('Authorization', generatedUsers.coordinator.token)
                .expect(status.OK)
                .end((err, res) => {
                    if (err) { return done(err); }
                    expect(res.body.cost).to.equal('125.00');
                    return done();
                });
        });

        it('should get the potential cost of attendance for a troop for another event', (done) => {
            request.get('/api/users/' + generatedUsers.coordinator.profile.id + '/events/' + generatedEvents[1].id + '/projectedCost')
                .set('Authorization', generatedUsers.coordinator.token)
                .expect(status.OK)
                .end((err, res) => {
                    if (err) { return done(err); }
                    expect(res.body.cost).to.equal('20.00');
                    return done();
                });
        });

        it('should get the potential cost of attendence for a different troop', (done) => {
            request.get('/api/users/' + generatedUsers.coordinator2.profile.id + '/events/' + generatedEvents[0].id + '/projectedCost')
                .set('Authorization', generatedUsers.coordinator2.token)
                .expect(status.OK)
                .end((err, res) => {
                    if (err) { return done(err); }
                    expect(res.body.cost).to.equal('20.00');
                    return done();
                });
        });

        it('should get the total potential income from an event', (done) => {
            request.get('/api/events/' + generatedEvents[0].id + '/potentialIncome')
                .set('Authorization', generatedUsers.admin.token)
                .expect(status.OK)
                .end((err, res) => {
                    if (err) { return done(err); }
                    expect(res.body.income).to.equal('145.00');
                    return done();
                });
        });

        it('should get the total potential income from another event', (done) => {
            request.get('/api/events/' + generatedEvents[1].id + '/potentialIncome')
                .set('Authorization', generatedUsers.admin.token)
                .expect(status.OK)
                .end((err, res) => {
                    if (err) { return done(err); }
                    expect(res.body.income).to.equal('20.00');
                    return done();
                });
        });

        it('should fail for an invalid user', (done) => {
            request.get('/api/users/1337/events/' + generatedEvents[0].id + '/projectedCost')
                .set('Authorization', generatedUsers.admin.token)
                .expect(status.BAD_REQUEST, done);
        });

        it('should fail for an invalid event', (done) => {
            request.get('/api/users/' + generatedUsers.coordinator2.profile.id + '/events/13370/projectedCost')
                .set('Authorization', generatedUsers.admin.token)
                .expect(status.BAD_REQUEST, done);
        });

        it('should fail for an invalid scout', (done) => {
            request.get('/api/scouts/1337/registrations/' + registrationIds[0] + '/projectedCost')
                .set('Authorization', generatedUsers.coordinator.token)
                .expect(status.BAD_REQUEST, done);
        });

        it('should fail for an invalid registration', (done) => {
            request.get('/api/scouts/' + generatedTroop1[1].id + '/registrations/1337/projectedCost')
                .set('Authorization', generatedUsers.coordinator.token)
                .expect(status.BAD_REQUEST, done);
        });

        it('should fail to get total potential income from an invalid event', (done) => {
            request.get('/api/events/1337/potentialIncome')
                .set('Authorization', generatedUsers.admin.token)
                .expect(status.BAD_REQUEST, done);
        });
    });

    describe('calculating real prices', () => {
        beforeEach((done) => {
            async.series([
                (cb) => {
                    request.post('/api/scouts/' + generatedTroop1[0].id + '/registrations/' + registrationIds[0] + '/assignments')
                        .set('Authorization', generatedUsers.teacher.token)
                        .send({
                            periods: [2, 3],
                            offering: offeringIds[1]
                        })
                        .expect(status.CREATED, cb);
                },
                (cb) => {
                    request.post('/api/scouts/' + generatedTroop1[1].id + '/registrations/' + registrationIds[1] + '/assignments')
                        .set('Authorization', generatedUsers.teacher.token)
                        .send({
                            periods: [1],
                            offering: offeringIds[0]
                        })
                        .expect(status.CREATED, cb);
                },
                (cb) => {
                    request.post('/api/scouts/' + generatedTroop1[1].id + '/registrations/' + registrationIds[2] + '/assignments')
                        .set('Authorization', generatedUsers.teacher.token)
                        .send({
                            periods: [1],
                            offering: offeringIds[0]
                        })
                        .expect(status.CREATED, cb);
                },
                (cb) => {
                    request.post('/api/scouts/' + generatedTroop2[1].id + '/registrations/' + registrationIds[3] + '/assignments')
                        .set('Authorization', generatedUsers.teacher.token)
                        .send({
                            offering: offeringIds[2],
                            periods: [1]
                        })
                        .expect(status.CREATED, cb);
                },
            ], done);
        });

        it('should calculate the actual cost for an individual scout', (done) => {
            request.get('/api/scouts/' + generatedTroop1[0].id + '/registrations/' + registrationIds[0] + '/cost')
                .set('Authorization', generatedUsers.coordinator.token)
                .expect(status.OK)
                .end((err, res) => {
                    if (err) { return done(err); }
                    expect(res.body.cost).to.equal('49.75');
                    return done();
                });
        });

        it('should calculate the actual cost for another scout', (done) => {
            request.get('/api/scouts/' + generatedTroop1[1].id + '/registrations/' + registrationIds[1] + '/cost')
                .set('Authorization', generatedUsers.coordinator.token)
                .expect(status.OK)
                .end((err, res) => {
                    if (err) { return done(err); }
                    expect(res.body.cost).to.equal('65.25');
                    return done();
                });
        });

        it('should calculate the actual cost for another scout and different registration', (done) => {
            request.get('/api/scouts/' + generatedTroop1[1].id + '/registrations/' + registrationIds[2] + '/cost')
                .set('Authorization', generatedUsers.coordinator.token)
                .expect(status.OK)
                .end((err, res) => {
                    if (err) { return done(err); }
                    expect(res.body.cost).to.equal('20.00');
                    return done();
                });
        });

        it('should get the cost of attendance for a troop', (done) => {
            request.get('/api/users/' + generatedUsers.coordinator.profile.id + '/events/' + generatedEvents[0].id + '/cost')
                .set('Authorization', generatedUsers.coordinator.token)
                .expect(status.OK)
                .end((err, res) => {
                    if (err) { return done(err); }
                    expect(res.body.cost).to.equal('115.00');
                    return done();
                });
        });

        it('should get the cost of attendance for a troop for another event', (done) => {
            request.get('/api/users/' + generatedUsers.coordinator.profile.id + '/events/' + generatedEvents[1].id + '/cost')
                .set('Authorization', generatedUsers.coordinator.token)
                .expect(status.OK)
                .end((err, res) => {
                    if (err) { return done(err); }
                    expect(res.body.cost).to.equal('20.00');
                    return done();
                });
        });

        it('should get the cost of attendence for a different troop', (done) => {
            request.get('/api/users/' + generatedUsers.coordinator2.profile.id + '/events/' + generatedEvents[0].id + '/cost')
                .set('Authorization', generatedUsers.coordinator2.token)
                .expect(status.OK)
                .end((err, res) => {
                    if (err) { return done(err); }
                    expect(res.body.cost).to.equal('20.00');
                    return done();
                });
        });

        it('should get the real income from an event', (done) => {
            request.get('/api/events/' + generatedEvents[0].id + '/income')
                .set('Authorization', generatedUsers.admin.token)
                .expect(status.OK)
                .end((err, res) => {
                    if (err) { return done(err); }
                    expect(res.body.income).to.equal('135.00');
                    return done();
                });
        });

        it('should get the real income from another event', (done) => {
            request.get('/api/events/' + generatedEvents[1].id + '/income')
                .set('Authorization', generatedUsers.admin.token)
                .expect(status.OK)
                .end((err, res) => {
                    if (err) { return done(err); }
                    expect(res.body.income).to.equal('20.00');
                    return done();
                });
        });

        it('should fail for an invalid user', (done) => {
            request.get('/api/users/1337/events/' + generatedEvents[0].id + '/cost')
                .set('Authorization', generatedUsers.admin.token)
                .expect(status.BAD_REQUEST, done);
        });

        it('should fail for an invalid event', (done) => {
            request.get('/api/users/' + generatedUsers.coordinator2.profile.id + '/events/13370/cost')
                .set('Authorization', generatedUsers.admin.token)
                .expect(status.BAD_REQUEST, done);
        });

        it('should fail for an invalid scout', (done) => {
            request.get('/api/scouts/1337/registrations/' + registrationIds[0] + '/cost')
                .set('Authorization', generatedUsers.coordinator.token)
                .expect(status.BAD_REQUEST, done);
        });

        it('should fail for an invalid registration', (done) => {
            request.get('/api/scouts/' + generatedTroop1[1].id + '/registrations/1337/cost')
                .set('Authorization', generatedUsers.coordinator.token)
                .expect(status.BAD_REQUEST, done);
        });

        it('should fail to get total income from an invalid event', (done) => {
            request.get('/api/events/1337/income')
                .set('Authorization', generatedUsers.admin.token)
                .expect(status.BAD_REQUEST, done);
        });
    });
});



