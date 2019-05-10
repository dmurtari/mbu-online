import supertest from 'supertest';
import * as async from 'async';
import status from 'http-status-codes';
import { expect } from 'chai';

import app from '@app/app';
import TestUtils from './testUtils';
import { Event } from '@models/event.model';
import { EventCreateDto, Semester, EventResponseDto, SetCurrentEventDto, CurrentEventResponseDto, GetCurrentEventDto, EventsResponseDto } from '@interfaces/event.interface';
import { UserRole } from '@interfaces/user.interface';
import { SuperTestResponse } from '@test/helpers/supertest.interface';

const request = supertest(app);

describe('events', () => {
    let coordinatorToken: string;
    let adminToken: string;
    const badId = TestUtils.badId;

    before(async () => {
        await TestUtils.dropDb();
    });

    before(async () => {
        const generatedTokens = await TestUtils.generateTokens([UserRole.COORDINATOR, UserRole.ADMIN]);
        coordinatorToken = generatedTokens[UserRole.COORDINATOR].token;
        adminToken = generatedTokens[UserRole.ADMIN].token;
    });

    beforeEach(async () => {
        await TestUtils.dropTable([Event]);
    });

    after(async () => {
        await TestUtils.dropDb();
    });

    describe('creating an event', () => {
        const testEvent: EventCreateDto = {
            year: 2016,
            semester: Semester.SPRING,
            date: new Date(2016, 3, 14),
            registration_open: new Date(2016, 1, 12),
            registration_close: new Date(2016, 3, 1),
            price: 10
        };

        it('should create events with year and semester', (done) => {
            request.post('/api/events')
                .set('Authorization', adminToken)
                .send(testEvent)
                .expect(status.CREATED, done);
        });

        it('should require authorization as admin', (done) => {
            request.post('/api/events')
                .set('Authorization', coordinatorToken)
                .send(testEvent)
                .expect(status.UNAUTHORIZED, done);
        });

        it('should fail gracefully for a blank request', (done) => {
            request.post('/api/events')
                .set('Authorization', adminToken)
                .send({})
                .expect(status.BAD_REQUEST, done);
        });

        it('should ignore extra fields', (done) => {
            const postData = testEvent as any;
            postData.extra = 'extra data';

            request.post('/api/events')
                .set('Authorization', adminToken)
                .send(postData)
                .expect(status.CREATED)
                .end((err, res: SuperTestResponse<EventResponseDto>) => {
                    if (err) { return done(err); }
                    expect((res.body.event as any).extra).not.to.exist;
                    done();
                });
        });
    });

    describe('when events already exist', () => {
        let id1: string;
        let id2: string;

        const testEvent1: EventCreateDto = {
            year: 2016,
            semester: Semester.SPRING,
            date: new Date(2016, 3, 14),
            registration_open: new Date(2016, 1, 12),
            registration_close: new Date(2016, 3, 1),
            price: 10
        };

        const testEvent2: EventCreateDto = {
            year: 2015,
            semester: Semester.FALL,
            date: new Date(2015, 11, 11),
            registration_open: new Date(2015, 9, 10),
            registration_close: new Date(2015, 11, 1),
            price: 10
        };

        beforeEach((done) => {
            async.series([
                (cb) => {
                    request.post('/api/events')
                        .set('Authorization', adminToken)
                        .send(testEvent1)
                        .expect(status.CREATED)
                        .end((err, res) => {
                            if (err) { return done(err); }
                            id1 = res.body.event.id;
                            cb();
                        });
                },
                (cb) => {
                    request.post('/api/events')
                        .set('Authorization', adminToken)
                        .send(testEvent2)
                        .expect(status.CREATED)
                        .end((err, res) => {
                            if (err) { return done(err); }
                            id2 = res.body.event.id;
                            cb();
                        });
                }
            ], done);
        });

        describe('the current event', () => {
            it('should set the current event', (done) => {
                request.post('/api/events/current')
                    .set('Authorization', adminToken)
                    .send(<SetCurrentEventDto>{ id: id1 })
                    .expect(status.OK)
                    .end((err, res: SuperTestResponse<CurrentEventResponseDto>) => {
                        if (err) { return done(err); }
                        expect(res.body.currentEvent.id).to.equal(id1);
                        done();
                    });
            });

            it('should not set for an invalid id', (done) => {
                request.post('/api/events/current')
                    .set('Authorization', adminToken)
                    .send(<SetCurrentEventDto>{ id: 10000 })
                    .expect(status.BAD_REQUEST, done);
            });

            it('should not allow teachers to set', (done) => {
                request.post('/api/events/current')
                    .send(<SetCurrentEventDto>{ id: id1 })
                    .expect(status.UNAUTHORIZED, done);
            });

            it('should get the current event', (done) => {
                async.series([
                    (cb) => {
                        request.post('/api/events/current')
                            .set('Authorization', adminToken)
                            .send({ id: id1 })
                            .expect(status.OK)
                            .end((err, res: SuperTestResponse<CurrentEventResponseDto>) => {
                                if (err) { return done(err); }
                                expect(res.body.currentEvent.id).to.equal(id1);
                                return cb();
                            });
                    },
                    (cb) => {
                        request.get('/api/events/current')
                            .expect(status.OK)
                            .end((err, res: SuperTestResponse<GetCurrentEventDto>) => {
                                if (err) { return done(err); }
                                expect(res.body.id).to.equal(id1);
                                return cb();
                            });
                    }
                ], done);
            });

            it('should keep track of the latest value', (done) => {
                async.series([
                    (cb) => {
                        request.post('/api/events/current')
                            .set('Authorization', adminToken)
                            .send({ id: id1 })
                            .expect(status.OK)
                            .end((err, res: SuperTestResponse<CurrentEventResponseDto>) => {
                                if (err) { return done(err); }
                                expect(res.body.currentEvent.id).to.equal(id1);
                                return cb();
                            });
                    },
                    (cb) => {
                        request.get('/api/events/current')
                            .expect(status.OK)
                            .end((err, res: SuperTestResponse<GetCurrentEventDto>) => {
                                if (err) { return done(err); }
                                expect(res.body.id).to.equal(id1);
                                return cb();
                            });
                    },
                    (cb) => {
                        request.post('/api/events/current')
                            .set('Authorization', adminToken)
                            .send({ id: id2 })
                            .expect(status.OK)
                            .end((err, res: SuperTestResponse<CurrentEventResponseDto>) => {
                                if (err) { return done(err); }
                                expect(res.body.currentEvent.id).to.equal(id2);
                                return cb();
                            });
                    },
                    (cb) => {
                        request.get('/api/events/current')
                            .expect(status.OK)
                            .end((err, res: SuperTestResponse<GetCurrentEventDto>) => {
                                if (err) { return done(err); }
                                expect(res.body.id).to.equal(id2);
                                return cb();
                            });
                    }
                ], done);
            });
        });

        describe('getting an event', () => {
            it('should be able to get an event by id', (done) => {
                async.series([
                    (cb) => {
                        request.get('/api/events?id=' + id1)
                            .expect(status.OK)
                            .end((err, res: SuperTestResponse<EventsResponseDto>) => {
                                if (err) { return done(err); }
                                const event = res.body[0];
                                expect(event.id).to.equal(id1);
                                cb();
                            });
                    },
                    (cb) => {
                        request.get('/api/events?id=' + id2)
                            .expect(status.OK)
                            .end((err, res: SuperTestResponse<EventsResponseDto>) => {
                                if (err) { return done(err); }
                                const event = res.body[0];
                                expect(event.id).to.equal(id2);
                                cb();
                            });
                    }
                ], done);
            });

            it('should get an event by year and semester', (done) => {
                async.series([
                    (cb) => {
                        request.get('/api/events?year=' + testEvent1.year + '&semester=' + testEvent1.semester)
                            .expect(status.OK)
                            .end((err, res: SuperTestResponse<EventsResponseDto>) => {
                                if (err) { return done(err); }
                                const event = res.body[0];
                                expect(event.year).to.equal(testEvent1.year);
                                expect(event.semester).to.equal(testEvent1.semester);
                                cb();
                            });
                    },
                    (cb) => {
                        request.get('/api/events?year=' + testEvent2.year + '&semester=' + testEvent2.semester)
                            .expect(status.OK)
                            .end((err, res: SuperTestResponse<EventsResponseDto>) => {
                                if (err) { return done(err); }
                                const event = res.body[0];
                                expect(event.year).to.equal(testEvent2.year);
                                expect(event.semester).to.equal(testEvent2.semester);
                                cb();
                            });
                    }
                ], done);
            });

            it('should find events by year', (done) => {
                request.get('/api/events?year=' + testEvent2.year)
                    .expect(status.OK)
                    .end((err, res: SuperTestResponse<EventsResponseDto>) => {
                        if (err) { return done(err); }
                        const event = res.body[0];
                        expect(event.id).to.equal(id2);
                        done();
                    });
            });

            it('should find events by semester', (done) => {
                request.get('/api/events?semester=' + testEvent1.semester)
                    .expect(status.OK)
                    .end((err, res: SuperTestResponse<EventsResponseDto>) => {
                        if (err) { return done(err); }
                        const event = res.body[0];
                        expect(event.id).to.equal(id1);
                        done();
                    });
            });

            it('should get all events if none is specified', (done) => {
                request.get('/api/events')
                    .expect(status.OK)
                    .end((err, res: SuperTestResponse<EventsResponseDto>) => {
                        if (err) { return done(err); }
                        const events = res.body;
                        expect(events.length).to.equal(2);
                        done();
                    });
            });

            it('should return empty if an event is not found by id', (done) => {
                request.get('/api/events?id=123123')
                    .expect(status.OK)
                    .end((err, res: SuperTestResponse<EventsResponseDto>) => {
                        if (err) { return done(err); }
                        const events = res.body;
                        expect(events.length).to.equal(0);
                        done();
                    });
            });

            it('should return empty if an event is not found by semester', (done) => {
                request.get('/api/events?semester=Summer')
                    .expect(status.OK)
                    .end((err, res: SuperTestResponse<EventsResponseDto>) => {
                        if (err) { return done(err); }
                        const events = res.body;
                        expect(events.length).to.equal(0);
                        done();
                    });
            });

            it('should return empty if an event is not found by year', (done) => {
                request.get('/api/events?year=1914')
                    .expect(status.OK)
                    .end((err, res: SuperTestResponse<EventsResponseDto>) => {
                        if (err) { return done(err); }
                        const events = res.body;
                        expect(events.length).to.equal(0);
                        done();
                    });
            });

            it('should return empty if an event is not found by year and semester', (done) => {
                request.get('/api/events?year=1916&semester=Spring')
                    .expect(status.OK)
                    .end((err, res: SuperTestResponse<EventsResponseDto>) => {
                        if (err) { return done(err); }
                        const events = res.body;
                        expect(events.length).to.equal(0);
                        done();
                    });
            });
        });

        describe('deleting an event', () => {
            it('should require authorization', (done) => {
                request.del('/api/events/' + id1)
                    .expect(status.UNAUTHORIZED, done);
            });

            it('should delete an event by id', (done) => {
                async.series([
                    (cb) => {
                        request.get('/api/events?id=' + id2)
                            .expect(status.OK, cb);
                    },
                    (cb) => {
                        request.del('/api/events/' + id2)
                            .set('Authorization', adminToken)
                            .expect(status.OK, cb);
                    },
                    (cb) => {
                        request.get('/api/events?id=' + id2)
                            .expect(status.OK)
                            .end((err, res) => {
                                if (err) { return done(err); }
                                const events = res.body;
                                expect(events.length).to.equal(0);
                                done();
                            });
                    }
                ], done);
            });

            it('should not delete a nonexistent id', (done) => {
                request.del('/api/events/' + badId)
                    .set('Authorization', adminToken)
                    .expect(status.BAD_REQUEST, done);
            });

            it('should not delete all events', (done) => {
                request.del('/api/events')
                    .set('Authorization', adminToken)
                    .expect(status.NOT_FOUND, done);
            });
        });

        describe('updating an event', () => {
            let eventUpdate: EventCreateDto;

            beforeEach(() => {
                eventUpdate = {
                    year: 2014,
                    semester: Semester.SPRING,
                    date: new Date(2014, 3, 14),
                    registration_open: new Date(2014, 1, 12),
                    registration_close: new Date(2014, 3, 1),
                    price: 5
                };
            });


            it('should update an event', (done) => {
                request.put('/api/events/' + id1)
                    .set('Authorization', adminToken)
                    .send(eventUpdate)
                    .expect(status.OK)
                    .end((err, res: SuperTestResponse<EventResponseDto>) => {
                        if (err) { return done(err); }
                        const event = res.body.event;
                        expect(event.id).to.equal(id1);
                        expect(event.year).to.equal(eventUpdate.year);
                        expect(event.price).to.equal(eventUpdate.price);
                        return done();
                    });
            });

            it('should require admin privileges', (done) => {
                request.put('/api/events/' + id1)
                    .set('Authorization', coordinatorToken)
                    .send(eventUpdate)
                    .expect(status.UNAUTHORIZED, done);
            });

            it('should allow partial updates', (done) => {
                delete eventUpdate.year;

                request.put('/api/events/' + id1)
                    .set('Authorization', adminToken)
                    .send(eventUpdate)
                    .expect(status.OK)
                    .end((err, res: SuperTestResponse<EventResponseDto>) => {
                        if (err) { return done(err); }
                        const event = res.body.event;
                        expect(event.id).to.equal(id1);
                        expect(event.year).to.equal(2016);
                        expect(event.price).to.equal(eventUpdate.price);
                        return done();
                    });
            });

            it('should delete only if explicitly set to null', (done) => {
                request.put('/api/events/' + id1)
                    .set('Authorization', adminToken)
                    .send({})
                    .expect(status.OK, done);
            });
        });
    });
});
