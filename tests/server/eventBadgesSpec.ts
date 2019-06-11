import supertest from 'supertest';
import * as async from 'async';
import status from 'http-status-codes';
import { expect } from 'chai';

import app from '@app/app';
import TestUtils from './testUtils';
import { Badge } from '@models/badge.model';
import { Event } from '@models/event.model';
import { UserRole } from '@interfaces/user.interface';
import { Offering } from '@models/offering.model';
import { CreateOfferingDto, OfferingInterface, OfferingResponseDto } from '@interfaces/offering.interface';
import { EventInterface, Semester, EventOfferingInterface, CreateOfferingResponseDto, EventsResponseDto, EventStatisticsDto } from '@interfaces/event.interface';
import { SuperTestResponse } from '@test/helpers/supertest.interface';

const request = supertest(app);

describe('event badge association', () => {
    let adminToken: string;
    let badges: Badge[];
    let events: Event[];

    const badId = TestUtils.badId;

    before(async () => {
        await TestUtils.dropDb();
    });

    before(async () => {
        adminToken = (await TestUtils.generateToken(UserRole.ADMIN)).token;
    });

    beforeEach(async () => {
        await TestUtils.dropTable([Event, Offering, Badge]);
    });

    beforeEach(async () => {
        badges = await TestUtils.createBadges();
        events = await TestUtils.createEvents();
    });

    after(async () => {
        await TestUtils.dropDb();
    });

    describe('when offerings do not exist', () => {
        it('should create a badge offering', (done) => {
            const postData: CreateOfferingDto = {
                badge_id: badges[1].id,
                offering: {
                    duration: 1,
                    periods: [1, 2, 3],
                    price: '10.00',
                    requirements: ['1', '2', '3a', '3b']
                }
            };

            request.post('/api/events/' + events[0].id + '/badges')
                .set('Authorization', adminToken)
                .send(postData)
                .expect(status.CREATED)
                .end((err, res: SuperTestResponse<CreateOfferingResponseDto>) => {
                    if (err) { return done(err); }
                    const event = res.body.event;
                    expect(event.offerings).to.have.lengthOf(1);
                    expect(event.offerings[0].details.price).to.equal(postData.offering.price);
                    expect(event.offerings[0].details.requirements).to.deep.equal(postData.offering.requirements);
                    expect(event.offerings[0].id).to.equal(badges[1].id);
                    return done();
                });
        });

        it('should default to a price of 0', (done) => {
            const postData: CreateOfferingDto = {
                badge_id: badges[0].id,
                offering: {
                    duration: 1,
                    periods: [1, 2, 3]
                }
            };

            request.post('/api/events/' + events[0].id + '/badges')
                .set('Authorization', adminToken)
                .send(postData)
                .expect(status.CREATED)
                .end((err, res: SuperTestResponse<CreateOfferingResponseDto>) => {
                    if (err) { return done(err); }
                    const event = res.body.event;
                    expect(event.offerings).to.have.lengthOf(1);
                    expect(event.offerings[0].details.price).to.equal('0.00');
                    expect(event.offerings[0].id).to.equal(badges[0].id);
                    return done();
                });
        });

        it('should default to empty requirements', (done) => {
            const postData: CreateOfferingDto = {
                badge_id: badges[1].id,
                offering: {
                    duration: 1,
                    periods: [1, 2, 3],
                    price: '10.00'
                }
            };

            request.post('/api/events/' + events[0].id + '/badges')
                .set('Authorization', adminToken)
                .send(postData)
                .expect(status.CREATED)
                .end((err, res: SuperTestResponse<CreateOfferingResponseDto>) => {
                    if (err) { return done(err); }
                    const event = res.body.event as EventOfferingInterface;
                    expect(event.offerings).to.have.lengthOf(1);
                    expect(event.offerings[0].details.price).to.equal(postData.offering.price);
                    expect(event.offerings[0].details.requirements).to.deep.equal([]);
                    expect(event.offerings[0].id).to.equal(badges[1].id);
                    return done();
                });
        });

        it('should not save null periods', (done) => {
            const postData: CreateOfferingDto = {
                badge_id: badges[1].id,
                offering: {
                    duration: 1,
                    periods: [1, 2, null],
                    price: '10.00'
                }
            };

            request.post('/api/events/' + events[0].id + '/badges')
                .set('Authorization', adminToken)
                .send(postData)
                .expect(status.CREATED)
                .end((err, res: SuperTestResponse<CreateOfferingResponseDto>) => {
                    if (err) { return done(err); }
                    const event = res.body.event;
                    expect(event.offerings).to.have.lengthOf(1);
                    expect(event.offerings[0].details.price).to.equal(postData.offering.price);
                    expect(event.offerings[0].details.periods).to.deep.equal([1, 2]);
                    expect(event.offerings[0].id).to.equal(badges[1].id);
                    return done();
                });
        });

        it('should create multiple offerings', (done) => {
            async.series([
                (cb) => {
                    const postData: CreateOfferingDto = {
                        badge_id: badges[0].id,
                        offering: {
                            duration: 1,
                            periods: [1, 2, 3],
                            price: 10
                        }
                    };

                    request.post('/api/events/' + events[0].id + '/badges')
                        .set('Authorization', adminToken)
                        .send(postData)
                        .expect(status.CREATED)
                        .end((err, res: SuperTestResponse<CreateOfferingResponseDto>) => {
                            if (err) { return done(err); }
                            const event = res.body.event;
                            expect(event.offerings).to.have.lengthOf(1);
                            const offering = event.offerings.find(_offering => _offering.id === badges[0].id);
                            expect(offering.details.price).to.equal('10.00');
                            expect(offering.details.duration).to.equal(1);
                            expect(offering.details.periods).to.eql([1, 2, 3]);
                            expect(offering.id).to.equal(badges[0].id);
                            return cb();
                        });
                },
                (cb) => {
                    const postData: CreateOfferingDto = {
                        badge_id: badges[1].id,
                        offering: {
                            duration: 2,
                            periods: [2, 3]
                        }
                    };
                    request.post('/api/events/' + events[0].id + '/badges')
                        .set('Authorization', adminToken)
                        .send(postData)
                        .expect(status.CREATED)
                        .end((err, res: SuperTestResponse<CreateOfferingResponseDto>) => {
                            if (err) { return done(err); }
                            const event = res.body.event;
                            expect(event.offerings).to.have.lengthOf(2);
                            const offering = event.offerings.find(_offering => _offering.id === badges[1].id);
                            expect(offering.details.price).to.equal('0.00');
                            expect(offering.details.duration).to.equal(2);
                            expect(offering.details.periods).to.eql([2, 3]);
                            expect(offering.id).to.equal(badges[1].id);
                            return cb();
                        });
                }
            ], done);
        });

        it('should not create an offering if the badge does not exist', (done) => {
            const postData: CreateOfferingDto = {
                badge_id: Number(badId),
                offering: {
                    duration: 1,
                    periods: [1, 2, 3]
                }
            };

            request.post('/api/events/' + events[0].id + '/badges')
                .set('Authorization', adminToken)
                .send(postData)
                .expect(status.BAD_REQUEST, done);
        });

        it('should not create an offering if the event does not exist', (done) => {
            const postData: CreateOfferingDto = {
                badge_id: badges[0].id,
                offering: {
                    duration: 1,
                    periods: [1, 2, 3]
                }
            };

            request.post('/api/events/' + badId + '/badges')
                .set('Authorization', adminToken)
                .send(postData)
                .expect(status.BAD_REQUEST, done);
        });

        it('should validate the presence of required fields', (done) => {
            const postData: any = {
                badge_id: badges[0].id
            };

            request.post('/api/events/' + events[0].id + '/badges')
                .set('Authorization', adminToken)
                .send(postData)
                .expect(status.BAD_REQUEST, done);
        });

        it('should validate for correct durations', (done) => {
            const postData: CreateOfferingDto = {
                badge_id: badges[0].id,
                offering: {
                    duration: 2,
                    periods: [1]
                }
            };

            request.post('/api/events/' + events[0].id + '/badges')
                .set('Authorization', adminToken)
                .send(postData)
                .expect(status.BAD_REQUEST, done);
        });

        it('should respond gracefully to bad ids', (done) => {
            const postData: CreateOfferingDto = {
                badge_id: badges[0].id,
                offering: {
                    duration: 1,
                    periods: [1, 2, 3]
                }
            };

            request.post('/api/events/123/badges')
                .set('Authorization', adminToken)
                .send(postData)
                .expect(status.BAD_REQUEST, done);
        });
    });

    describe('when offerings exist', () => {
        let offerings: Offering[];
        const defaultPostData: OfferingInterface = {
            price: 10,
            periods: [1, 2, 3],
            duration: 1,
            requirements: ['1', '2a', '3']
        };

        beforeEach(async () => {
            offerings = await TestUtils.createOfferingsForEvent(events[0], badges, defaultPostData);
        });

        describe('getting offerings', () => {
            it('should get all offerings for an event', (done) => {
                request.get('/api/events?id=' + events[0].id)
                    .expect(status.OK)
                    .end((err, res: SuperTestResponse<EventsResponseDto>) => {
                        if (err) { return done(err); }
                        const event = res.body[0];
                        expect(event.offerings.length).to.equal(3);
                        expect(event.offerings.map(offering => offering.id)).to.have.same.members(badges.map(badge => badge.id));
                        return done();
                    });
            });

            it('should get offerings as part of the event stats', (done) => {
                request.get('/api/events/' + events[0].id + '/stats')
                .set('Authorization', adminToken)
                .expect(status.OK)
                .end((err, res: SuperTestResponse<EventStatisticsDto>) => {
                    if (err) { return done(err) }
                    const stats = res.body;
                    expect(stats.registrations).to.have.length(0);
                    expect(stats.scouts).to.have.length(0);
                    expect(stats.offerings).to.have.length(3);
                    return done();
                });
            });
        });

        describe('updating offerings', () => {
            it('should be able to update without specifying a badge', (done) => {
                const offeringUpdate: OfferingInterface = {
                    duration: 1,
                    periods: [1, 2],
                    price: '5.00',
                    requirements: ['1', '2b']
                };

                request.put('/api/events/' + events[0].id + '/badges/' + offerings[0].badge_id)
                    .set('Authorization', adminToken)
                    .send(offeringUpdate)
                    .end((err, res: SuperTestResponse<OfferingResponseDto>) => {
                        if (err) { return done(err); }
                        const offering = res.body.offering;
                        expect(offering.badge_id).to.equal(badges[0].id);
                        expect(offering.duration).to.equal(offeringUpdate.duration);
                        expect(offering.periods).to.deep.equal(offeringUpdate.periods);
                        expect(offering.price).to.equal(offeringUpdate.price);
                        expect(offering.requirements).to.deep.equal(offeringUpdate.requirements);
                        return done();
                    });
            });

            it('should not require price', (done) => {
                const offeringUpdate: OfferingInterface = {
                    duration: 1,
                    periods: [1, 2]
                };

                request.put('/api/events/' + events[0].id + '/badges/' + offerings[0].badge_id)
                    .set('Authorization', adminToken)
                    .send(offeringUpdate)
                    .end((err, res: SuperTestResponse<OfferingResponseDto>) => {
                        if (err) { return done(err); }
                        const offering = res.body.offering;
                        expect(offering.badge_id).to.equal(badges[0].id);
                        expect(offering.duration).to.equal(1);
                        expect(offering.periods).to.deep.equal([1, 2]);
                        expect(offering.price).to.equal('10.00'); // Default value for price if not specified
                        return done();
                    });
            });

            it('should should not save null periods', (done) => {
                const offeringUpdate: OfferingInterface = {
                    duration: 1,
                    periods: [1, 2, null]
                };

                request.put('/api/events/' + events[0].id + '/badges/' + offerings[0].badge_id)
                    .set('Authorization', adminToken)
                    .send(offeringUpdate)
                    .end((err, res: SuperTestResponse<OfferingResponseDto>) => {
                        if (err) { return done(err); }
                        const offering = res.body.offering;
                        expect(offering.badge_id).to.equal(badges[0].id);
                        expect(offering.duration).to.equal(1);
                        expect(offering.periods).to.deep.equal([1, 2]);
                        expect(offering.price).to.equal('10.00'); // Default value for price if not specified
                        return done();
                    });
            });

            it('should not delete existing offerings if an event is updating without supplying offerings', (done) => {
                const eventUpdate: EventInterface = {
                    year: 2014,
                    semester: Semester.SPRING,
                    date: new Date(2014, 3, 14),
                    registration_open: new Date(2014, 1, 12),
                    registration_close: new Date(2014, 3, 1),
                    price: 5
                };

                request.put('/api/events/' + events[0].id)
                    .set('Authorization', adminToken)
                    .send(eventUpdate)
                    .expect(status.OK)
                    .end((err, res: SuperTestResponse<CreateOfferingResponseDto>) => {
                        if (err) { return done(err); }
                        const event = res.body.event;
                        expect(event.id).to.equal(events[0].id);
                        expect(event.year).to.equal(eventUpdate.year);
                        expect(event.price).to.equal(eventUpdate.price);
                        expect(event.offerings).to.have.lengthOf(3);
                        return done();
                    });
            });

            it('should not allow an update with invalid information', (done) => {
                const offeringUpdate: OfferingInterface = {
                    duration: 2,
                    periods: [1]
                };

                request.put('/api/events/' + events[0].id + '/badges/' + offerings[0].badge_id)
                    .set('Authorization', adminToken)
                    .send(offeringUpdate)
                    .expect(status.BAD_REQUEST, done);
            });

            it('should not update with extra fields', (done) => {
                const offeringUpdate: any = {
                    duration: 1,
                    periods: [1, 2],
                    price: '5.00',
                    extra: true
                };

                request.put('/api/events/' + events[0].id + '/badges/' + offerings[0].badge_id)
                    .set('Authorization', adminToken)
                    .send(offeringUpdate)
                    .end((err, res: SuperTestResponse<OfferingResponseDto>) => {
                        if (err) { return done(err); }
                        const offering = res.body.offering;
                        expect(offering.badge_id).to.equal(badges[0].id);
                        expect(offering.duration).to.equal(offeringUpdate.duration);
                        expect(offering.periods).to.deep.equal(offeringUpdate.periods);
                        expect(offering.price).to.equal(offeringUpdate.price);
                        expect((offering as any).extra).to.not.exist;
                        return done();
                    });
            });

            it('should update without deleting fields', (done) => {
                const offeringUpdate: OfferingInterface = {
                    duration: 1
                };
                request.put('/api/events/' + events[0].id + '/badges/' + offerings[0].badge_id)
                    .set('Authorization', adminToken)
                    .send(offeringUpdate)
                    .expect(status.OK)
                    .end((err, res: SuperTestResponse<OfferingResponseDto>) => {
                        if (err) { return done(err); }
                        const offering = res.body.offering;
                        expect(offering.badge_id).to.equal(badges[0].id);
                        expect(offering.duration).to.equal(offeringUpdate.duration);
                        expect(offering.periods).to.deep.equal(offerings[0].periods);
                        expect(offering.price).to.equal(offerings[0].price);
                        expect(offering.requirements).to.deep.equal(offerings[0].requirements);
                        return done();
                    });
            });

            it('should not update a nonexistent event', (done) => {
                const offeringUpdate: OfferingInterface = {
                    duration: 1,
                    periods: [1, 2],
                    price: 5
                };

                request.put('/api/events/' + badId + '/badges/' + offerings[0].badge_id)
                    .set('Authorization', adminToken)
                    .send(offeringUpdate)
                    .expect(status.BAD_REQUEST, done);
            });

            it('should not update a nonexistent offering', (done) => {
                const offeringUpdate: OfferingInterface = {
                    duration: 1,
                    periods: [1, 2],
                    price: 5
                };

                request.put('/api/events/' + events[0].id + '/badges/' + badId)
                    .set('Authorization', adminToken)
                    .send(offeringUpdate)
                    .expect(status.BAD_REQUEST, done);
            });
        });

        describe('deleting offerings', () => {
            it('should be able to delete an offering', (done) => {
                async.series([
                    (cb) => {
                        request.get('/api/events?id=' + events[0].id)
                            .expect(status.OK)
                            .end((err, res: SuperTestResponse<EventsResponseDto>) => {
                                if (err) { return cb(err); }
                                const event = res.body[0];
                                expect(event.offerings).to.have.lengthOf(3);
                                return cb();
                            });
                    },
                    (cb) => {
                        request.del('/api/events/' + events[0].id + '/badges/' + offerings[1].badge_id)
                            .set('Authorization', adminToken)
                            .expect(status.OK, cb);
                    },
                    (cb) => {
                        request.get('/api/events?id=' + events[0].id)
                            .expect(status.OK)
                            .end((err, res: SuperTestResponse<EventsResponseDto>) => {
                                if (err) { return cb(err); }
                                const event = res.body[0];
                                expect(event.offerings).to.have.lengthOf(2);
                                return cb();
                            });
                    }
                ], done);
            });

            it('should require authorization', (done) => {
                request.del('/api/events/' + events[0].id + '/badges/' + offerings[0].badge_id)
                    .expect(status.UNAUTHORIZED, done);
            });

            it('should not delete from a nonexistant event', (done) => {
                request.del('/api/events/' + badId + '/badges/' + offerings[0].badge_id)
                    .set('Authorization', adminToken)
                    .expect(status.BAD_REQUEST, done);
            });

            it('should not delete a nonexistant offering', (done) => {
                request.del('/api/events/' + events[0].id + '/badges/' + badId)
                    .set('Authorization', adminToken)
                    .expect(status.BAD_REQUEST, done);
            });
        });
    });
});
