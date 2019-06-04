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
import testScouts from './testScouts';
import { CreateOfferingDto, OfferingInterface } from '@interfaces/offering.interface';
import { CreateAssignmentRequestDto } from '@interfaces/assignment.interface';

const request = supertest(app);

describe('Class sizes', () => {
    let badges: Badge[];
    let events: Event[];
    let generatedUsers: RoleTokenObjects;
    let generatedScouts: Scout[];
    let registrationIds: string[];

    before(async () => {
        await TestUtils.dropDb();
    });

    before(async () => {
        generatedUsers = await TestUtils.generateTokens();
    });

    beforeEach(async () => {
        await TestUtils.dropTable([Event, Offering, Badge, Assignment, Registration]);
    });

    beforeEach(async () => {
        badges = await TestUtils.createBadges();
        events = await TestUtils.createEvents();
        generatedScouts = await TestUtils.createScoutsForUser(generatedUsers.coordinator, testScouts(6));
    });

    beforeEach((done) => {
        registrationIds = [];

        async.forEachOfSeries(generatedScouts, (scout, index, cb) => {
            request.post('/api/scouts/' + scout.id + '/registrations')
                .set('Authorization', generatedUsers.coordinator.token)
                .send({
                    event_id: events[0].id
                })
                .expect(status.CREATED)
                .end((err, res) => {
                    if (err) { return done(err); }
                    registrationIds.push(res.body.registration.id);
                    return cb();
                });
        }, (err) => {
            done(err);
        });
    });

    after(async () => {
        await TestUtils.dropDb();
    });

    describe('when offerings do not exist', () => {
        let postData: CreateOfferingDto;

        beforeEach(() => {
            postData = {
                badge_id: badges[1].id,
                offering: {
                    duration: 1,
                    periods: [1, 2, 3],
                    price: '10.00',
                    requirements: ['1', '2', '3a', '3b']
                }
            };
        });

        it('should default to 20 as the size limit', (done) => {
            request.post('/api/events/' + events[0].id + '/badges')
                .set('Authorization', generatedUsers.admin.token)
                .send(postData)
                .expect(status.CREATED)
                .end((err, res) => {
                    if (err) { return done(err); }
                    const event = res.body.event;
                    expect(event.offerings).to.have.lengthOf(1);
                    expect(event.offerings[0].details.size_limit).to.equal(20);
                    return done();
                });
        });

        it('should accept an input for class size', (done) => {
            postData.offering.size_limit = 30;

            request.post('/api/events/' + events[0].id + '/badges')
                .set('Authorization', generatedUsers.admin.token)
                .send(postData)
                .expect(status.CREATED)
                .end((err, res) => {
                    if (err) { return done(err); }
                    const event = res.body.event;
                    expect(event.offerings).to.have.lengthOf(1);
                    expect(event.offerings[0].details.size_limit).to.equal(30);
                    return done();
                });
        });

        it('should not allow a negative class size', (done) => {
            postData.offering.size_limit = -1;

            request.post('/api/events/' + events[0].id + '/badges')
                .set('Authorization', generatedUsers.admin.token)
                .send(postData)
                .expect(status.BAD_REQUEST, done);
        });

        it('should expect a number', (done) => {
            postData.offering.size_limit = 'hello' as any;

            request.post('/api/events/' + events[0].id + '/badges')
                .set('Authorization', generatedUsers.admin.token)
                .send(postData)
                .expect(status.BAD_REQUEST, done);
        });
    });

    describe('when an offering exists with a size limit of 1', () => {
        let offering: OfferingInterface;
        let assignmentData: CreateAssignmentRequestDto;

        beforeEach((done) => {
            const postData: CreateOfferingDto = {
                badge_id: badges[1].id,
                offering: {
                    duration: 1,
                    periods: [1, 2, 3],
                    price: '10.00',
                    requirements: ['1', '2', '3a', '3b'],
                    size_limit: 1
                }
            };

            request.post('/api/events/' + events[0].id + '/badges')
                .set('Authorization', generatedUsers.admin.token)
                .send(postData)
                .expect(status.CREATED)
                .end((err, res) => {
                    if (err) { return done(err); }
                    const event = res.body.event;
                    offering = event.offerings[0];
                    return done();
                });
        });

        beforeEach(() => {
            assignmentData = {
                periods: [1],
                offering: (offering as any).details.id
            };
        });

        it('should get the allowed class size', (done) => {
            request.get('/api/events?id=' + events[0].id)
                .expect(status.OK)
                .end((err, res) => {
                    if (err) { return done(err); }
                    const event = res.body[0];
                    expect(event.offerings.length).to.equal(1);
                    const offeringResponse = event.offerings[0];
                    expect(offeringResponse.details.size_limit).to.equal(1);
                    return done();
                });
        });

        it('should know that there are no enrolled scouts', (done) => {
            request.get('/api/events/' + events[0].id + '/badges/' + offering.id + '/limits')
                .set('Authorization', generatedUsers.teacher.token)
                .expect(status.OK)
                .end((err, res) => {
                    if (err) { return done(err); }
                    const sizeInfo = res.body;
                    expect(sizeInfo).to.deep.equal({
                        size_limit: 1,
                        total: 0,
                        1: 0,
                        2: 0,
                        3: 0
                    });
                    return done();
                });
        });

        it('should allow joining if under the limit for a period', (done) => {
            request.post('/api/scouts/' + generatedScouts[0].id + '/registrations/' + registrationIds[0] + '/assignments')
                .set('Authorization', generatedUsers.teacher.token)
                .send(assignmentData)
                .expect(status.CREATED, done);
        });

        it('should allow joining multiple periods under the limit', (done) => {
            async.series([
                (cb) => {
                    request.post('/api/scouts/' + generatedScouts[0].id + '/registrations/' + registrationIds[0] + '/assignments')
                        .set('Authorization', generatedUsers.teacher.token)
                        .send(assignmentData)
                        .expect(status.CREATED, cb);
                },
                (cb) => {
                    assignmentData.periods = [2];

                    request.post('/api/scouts/' + generatedScouts[1].id + '/registrations/' + registrationIds[1] + '/assignments')
                        .set('Authorization', generatedUsers.teacher.token)
                        .send(assignmentData)
                        .expect(status.CREATED, cb);
                }
            ], done);
        });

        describe('and one scout has been assigned', () => {
            let offeringId: string;

            beforeEach((done) => {
                request.post('/api/scouts/' + generatedScouts[0].id + '/registrations/' + registrationIds[0] + '/assignments')
                    .set('Authorization', generatedUsers.teacher.token)
                    .send(assignmentData)
                    .expect(status.CREATED)
                    .end((err, res) => {
                        offeringId = res.body.registration.assignments[0].offering_id;
                        return done();
                    });
            });

            it('should know that there is one scout registered', (done) => {
                request.get('/api/events/' + events[0].id + '/badges/' + offering.id + '/limits')
                    .set('Authorization', generatedUsers.teacher.token)
                    .expect(status.OK)
                    .end((err, res) => {
                        if (err) { return done(err); }
                        const sizeInfo = res.body;
                        expect(sizeInfo).to.deep.equal({
                            size_limit: 1,
                            total: 1,
                            1: 1,
                            2: 0,
                            3: 0
                        });
                        return done();
                    });
            });

            it('should not allow the scout to join a different period', (done) => {
                request.put('/api/scouts/' + generatedScouts[0].id + '/registrations/' + registrationIds[0] + '/assignments/' +
                    assignmentData.offering)
                    .set('Authorization', generatedUsers.teacher.token)
                    .send({
                        periods: [3]
                    })
                    .expect(status.OK, done);
            });

            it('should allow a scout to join a different period', (done) => {
                assignmentData.periods = [2];

                request.post('/api/scouts/' + generatedScouts[1].id + '/registrations/' + registrationIds[1] + '/assignments')
                    .set('Authorization', generatedUsers.teacher.token)
                    .send(assignmentData)
                    .expect(status.CREATED, done);
            });

            it('should not allow another scout to join the same period', (done) => {
                request.post('/api/scouts/' + generatedScouts[1].id + '/registrations/' + registrationIds[1] + '/assignments')
                    .set('Authorization', generatedUsers.teacher.token)
                    .send(assignmentData)
                    .expect(status.BAD_REQUEST, done);
            });

            it('should allow setting completions for that scout', (done) => {
                request.put('/api/scouts/' + generatedScouts[0].id + '/registrations/' + registrationIds[0] + '/assignments/' + offeringId)
                    .set('Authorization', generatedUsers.admin.token)
                    .send({
                        completions: ['1']
                    })
                    .expect(status.OK, done);
            });

            describe('and a scout has joined a different period', () => {
                beforeEach((done) => {
                    assignmentData.periods = [2];

                    request.post('/api/scouts/' + generatedScouts[1].id + '/registrations/' + registrationIds[1] + '/assignments')
                        .set('Authorization', generatedUsers.teacher.token)
                        .send(assignmentData)
                        .expect(status.CREATED, done);
                });

                it('should not allow editing the scout to be in a full class', (done) => {
                    request.put('/api/scouts/' + generatedScouts[1].id + '/registrations/' + registrationIds[1] + '/assignments/' +
                        assignmentData.offering)
                        .set('Authorization', generatedUsers.teacher.token)
                        .send({
                            periods: [1]
                        })
                        .expect(status.BAD_REQUEST, done);
                });
            });
        });
    });

    describe('when a 2 period offering exists', () => {
        let offering: OfferingInterface;
        let assignmentData: CreateAssignmentRequestDto;

        beforeEach((done) => {
            const postData: CreateOfferingDto = {
                badge_id: badges[1].id,
                offering: {
                    duration: 2,
                    periods: [2, 3],
                    price: '10.00',
                    requirements: ['1', '2', '3a', '3b'],
                    size_limit: 3
                }
            };

            request.post('/api/events/' + events[0].id + '/badges')
                .set('Authorization', generatedUsers.admin.token)
                .send(postData)
                .expect(status.CREATED)
                .end((err, res) => {
                    if (err) { return done(err); }
                    const event = res.body.event;
                    offering = event.offerings[0];
                    return done();
                });
        });

        beforeEach(() => {
            assignmentData = {
                periods: [1],
                offering: (offering as any).details.id
            };
        });

        it('should know that there are no scouts assigned', (done) => {
            request.get('/api/events/' + events[0].id + '/badges/' + offering.id + '/limits')
                .set('Authorization', generatedUsers.teacher.token)
                .expect(status.OK)
                .end((err, res) => {
                    if (err) { return done(err); }
                    const sizeInfo = res.body;
                    expect(sizeInfo).to.deep.equal({
                        size_limit: 3,
                        total: 0,
                        1: 0,
                        2: 0,
                        3: 0
                    });
                    return done();
                });
        });

        describe('when a scout is assigned', () => {
            beforeEach((done) => {
                request.post('/api/scouts/' + generatedScouts[0].id + '/registrations/' + registrationIds[0] + '/assignments')
                    .set('Authorization', generatedUsers.teacher.token)
                    .send(assignmentData)
                    .expect(status.CREATED, done);
            });

            it('should know there is only one scout registered', (done) => {
                request.get('/api/events/' + events[0].id + '/badges/' + offering.id + '/limits')
                    .set('Authorization', generatedUsers.teacher.token)
                    .expect(status.OK)
                    .end((err, res) => {
                        if (err) { return done(err); }
                        const sizeInfo = res.body;
                        expect(sizeInfo).to.deep.equal({
                            size_limit: 3,
                            total: 1,
                            1: 1,
                            2: 0,
                            3: 0
                        });
                        return done();
                    });
            });
        });
    });

    describe('when an offering exists with a limit of 3', () => {
        let offering: OfferingInterface;
        let assignmentData: CreateAssignmentRequestDto;

        beforeEach((done) => {
            const postData: CreateOfferingDto = {
                badge_id: badges[1].id,
                offering: {
                    duration: 1,
                    periods: [1, 2, 3],
                    price: '10.00',
                    requirements: ['1', '2', '3a', '3b'],
                    size_limit: 3
                }
            };

            request.post('/api/events/' + events[0].id + '/badges')
                .set('Authorization', generatedUsers.admin.token)
                .send(postData)
                .expect(status.CREATED)
                .end((err, res) => {
                    if (err) { return done(err); }
                    const event = res.body.event;
                    offering = event.offerings[0];
                    return done();
                });
        });

        beforeEach(() => {
            assignmentData = {
                periods: [1],
                offering: (offering as any).details.id
            };
        });

        it('should know that there are no scouts assigned', (done) => {
            request.get('/api/events/' + events[0].id + '/badges/' + offering.id + '/limits')
                .set('Authorization', generatedUsers.teacher.token)
                .expect(status.OK)
                .end((err, res) => {
                    if (err) { return done(err); }
                    const sizeInfo = res.body;
                    expect(sizeInfo).to.deep.equal({
                        size_limit: 3,
                        total: 0,
                        1: 0,
                        2: 0,
                        3: 0
                    });
                    return done();
                });
        });

        describe('and scouts have been assigned', () => {
            beforeEach((done) => {
                async.series([
                    (cb) => {
                        request.post('/api/scouts/' + generatedScouts[0].id + '/registrations/' + registrationIds[0] + '/assignments')
                            .set('Authorization', generatedUsers.teacher.token)
                            .send(assignmentData)
                            .expect(status.CREATED, cb);
                    },
                    (cb) => {
                        request.post('/api/scouts/' + generatedScouts[1].id + '/registrations/' + registrationIds[1] + '/assignments')
                            .set('Authorization', generatedUsers.teacher.token)
                            .send(assignmentData)
                            .expect(status.CREATED, cb);
                    },
                    (cb) => {
                        request.post('/api/scouts/' + generatedScouts[2].id + '/registrations/' + registrationIds[2] + '/assignments')
                            .set('Authorization', generatedUsers.teacher.token)
                            .send(assignmentData)
                            .expect(status.CREATED, cb);
                    },
                    (cb) => {
                        assignmentData.periods = [2];
                        cb();
                    },
                    (cb) => {
                        request.post('/api/scouts/' + generatedScouts[3].id + '/registrations/' + registrationIds[3] + '/assignments')
                            .set('Authorization', generatedUsers.teacher.token)
                            .send(assignmentData)
                            .expect(status.CREATED, cb);
                    }
                ], done);
            });

            it('should return the correct class sizes', (done) => {
                request.get('/api/events/' + events[0].id + '/badges/' + offering.id + '/limits')
                    .set('Authorization', generatedUsers.teacher.token)
                    .expect(status.OK)
                    .end((err, res) => {
                        if (err) { return done(err); }
                        const sizeInfo = res.body;
                        expect(sizeInfo).to.deep.equal({
                            size_limit: 3,
                            total: 4,
                            1: 3,
                            2: 1,
                            3: 0
                        });
                        return done();
                    });
            });

            it('should not allow joining a full class period', (done) => {
                assignmentData.periods = [1];

                request.post('/api/scouts/' + generatedScouts[5].id + '/registrations/' + registrationIds[5] + '/assignments')
                    .set('Authorization', generatedUsers.teacher.token)
                    .send(assignmentData)
                    .expect(status.BAD_REQUEST, done);
            });

            it('should allow joining a class period with room', (done) => {
                assignmentData.periods = [2];

                request.post('/api/scouts/' + generatedScouts[5].id + '/registrations/' + registrationIds[5] + '/assignments')
                    .set('Authorization', generatedUsers.teacher.token)
                    .send(assignmentData)
                    .expect(status.CREATED, done);
            });
        });
    });
});
