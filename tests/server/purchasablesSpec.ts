import supertest from 'supertest';
import * as async from 'async';
import status from 'http-status-codes';
import { expect } from 'chai';

import app from '@app/app';
import TestUtils, { RoleTokenObjects } from './testUtils';
import { Event } from '@models/event.model';
import { Scout } from '@models/scout.model';
import { UserRole } from '@interfaces/user.interface';
import { Purchasable } from '@models/purchasable.model';
import {
    CreatePurchasableDto,
    UpdatePurchasableResponseDto,
    CreatePurchasablesResponseDto,
    PurchasablesResponseDto,
    UpdatePurchasableDto
} from '@interfaces/purchasable.interface';
import { Registration } from '@models/registration.model';
import { Purchase } from '@models/purchase.model';
import testScouts from './testScouts';
import { CreatePurchaseRequestDto, Size, CreatePurchaseResponseDto, ScoutPurchasesResponseDto, BuyersResponseDto } from '@interfaces/purchase.interface';
import { SuperTestResponse } from '@test/helpers/supertest.interface';
import { EventsResponseDto } from '@interfaces/event.interface';
import { RegistrationDto, CreateRegistrationResponseDto } from '@interfaces/registration.interface';

const request = supertest(app);

describe('purchasables', () => {
    let events: Event[];
    let generatedUsers: RoleTokenObjects;
    let generatedScouts: Scout[];
    let scoutId: string;

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

        events = await TestUtils.createEvents();
    });

    beforeEach(async () => {
        await TestUtils.dropTable([Purchasable]);
    });

    after(async () => {
        await TestUtils.dropDb();
    });

    describe('creating a purchasable', () => {
        it('should be able to be created for an event', (done) => {
            const postData: CreatePurchasableDto = {
                item: 'T-Shirt',
                description: 'A t-shirt',
                price: '10.00'
            };

            request.post('/api/events/' + events[0].id + '/purchasables')
                .set('Authorization', generatedUsers.admin.token)
                .send(postData)
                .expect(status.CREATED)
                .end((err, res: SuperTestResponse<CreatePurchasablesResponseDto>) => {
                    if (err) { return done(err); }
                    const purchasable = res.body.purchasables[0];
                    expect(purchasable.item).to.equal(postData.item);
                    expect(purchasable.description).to.equal(postData.description);
                    expect(purchasable.price).to.equal(postData.price);
                    return done();
                });
        });

        it('should not require a description', (done) => {
            const postData: CreatePurchasableDto = {
                item: 'T-Shirt',
                price: '10.00'
            };

            request.post('/api/events/' + events[0].id + '/purchasables')
                .set('Authorization', generatedUsers.admin.token)
                .send(postData)
                .expect(status.CREATED)
                .end((err, res: SuperTestResponse<CreatePurchasablesResponseDto>) => {
                    if (err) { return done(err); }
                    const purchasable = res.body.purchasables[0];
                    expect(purchasable.item).to.equal(postData.item);
                    expect(purchasable.price).to.equal(postData.price);
                    return done();
                });
        });

        it('should be created with a maximum age', (done) => {
            const postData: CreatePurchasableDto = {
                item: 'Youth Lunch',
                price: '10.00',
                maximum_age: 10
            };

            request.post('/api/events/' + events[0].id + '/purchasables')
                .set('Authorization', generatedUsers.admin.token)
                .send(postData)
                .expect(status.CREATED)
                .end((err, res: SuperTestResponse<CreatePurchasablesResponseDto>) => {
                    if (err) { return done(err); }
                    const purchasable = res.body.purchasables[0];
                    expect(purchasable.item).to.equal(postData.item);
                    expect(purchasable.price).to.equal(postData.price);
                    expect(purchasable.maximum_age).to.equal(postData.maximum_age);
                    return done();
                });
        });

        it('should not allow a blank maximum age', (done) => {
            const postData: any = {
                item: 'Youth Lunch',
                price: '10.00',
                maximum_age: ''
            };

            request.post('/api/events/' + events[0].id + '/purchasables')
                .set('Authorization', generatedUsers.admin.token)
                .send(postData)
                .expect(status.BAD_REQUEST, done);
        });

        it('should not allow a blank minimum age', (done) => {
            const postData: any = {
                item: 'Youth Lunch',
                price: '10.00',
                minimum_age: ''
            };

            request.post('/api/events/' + events[0].id + '/purchasables')
                .set('Authorization', generatedUsers.admin.token)
                .send(postData)
                .expect(status.BAD_REQUEST, done);
        });

        it('should be created with whether the item has a size', (done) => {
            const postData: CreatePurchasableDto = {
                item: 'T-Shirt',
                price: '10.00',
                has_size: true
            };

            request.post('/api/events/' + events[0].id + '/purchasables')
                .set('Authorization', generatedUsers.admin.token)
                .send(postData)
                .expect(status.CREATED)
                .end((err, res: SuperTestResponse<CreatePurchasablesResponseDto>) => {
                    if (err) { return done(err); }
                    const purchasable = res.body.purchasables[0];
                    expect(purchasable.item).to.equal(postData.item);
                    expect(purchasable.price).to.equal(postData.price);
                    expect(purchasable.has_size).to.be.true;
                    return done();
                });
        });

        it('should not allow size as an empty string', (done) => {
            const postData: any = {
                item: 'Youth Lunch',
                price: '10.00',
                has_size: ''
            };

            request.post('/api/events/' + events[0].id + '/purchasables')
                .set('Authorization', generatedUsers.admin.token)
                .send(postData)
                .expect(status.BAD_REQUEST, done);
        });

        it('should be created with a minimum', (done) => {
            const postData: CreatePurchasableDto = {
                item: 'Adult Lunch',
                price: '12.00',
                minimum_age: 10
            };

            request.post('/api/events/' + events[0].id + '/purchasables')
                .set('Authorization', generatedUsers.admin.token)
                .send(postData)
                .expect(status.CREATED)
                .end((err, res: SuperTestResponse<CreatePurchasablesResponseDto>) => {
                    if (err) { return done(err); }
                    const purchasable = res.body.purchasables[0];
                    expect(purchasable.item).to.equal(postData.item);
                    expect(purchasable.price).to.equal(postData.price);
                    expect(purchasable.minimum_age).to.equal(postData.minimum_age);
                    return done();
                });
        });

        it('should create with an age range', (done) => {
            const postData: CreatePurchasableDto = {
                item: 'Teen Lunch',
                price: '12.00',
                minimum_age: 12,
                maximum_age: 18
            };

            request.post('/api/events/' + events[0].id + '/purchasables')
                .set('Authorization', generatedUsers.admin.token)
                .send(postData)
                .expect(status.CREATED)
                .end((err, res: SuperTestResponse<CreatePurchasablesResponseDto>) => {
                    if (err) { return done(err); }
                    const purchasable = res.body.purchasables[0];
                    expect(purchasable.item).to.equal(postData.item);
                    expect(purchasable.price).to.equal(postData.price);
                    expect(purchasable.minimum_age).to.equal(postData.minimum_age);
                    expect(purchasable.maximum_age).to.equal(postData.maximum_age);
                    return done();
                });
        });

        it('should not create with an invalid range', (done) => {
            const postData: CreatePurchasableDto = {
                item: 'Teen Lunch',
                price: '12.00',
                minimum_age: 18,
                maximum_age: 12
            };

            request.post('/api/events/' + events[0].id + '/purchasables')
                .set('Authorization', generatedUsers.admin.token)
                .send(postData)
                .expect(status.BAD_REQUEST, done);
        });

        it('should not allow an invalid age', (done) => {
            const postData: any = {
                item: 'Teen Lunch',
                price: '12.00',
                minimum_age: 'twelve'
            };

            request.post('/api/events/' + events[0].id + '/purchasables')
                .set('Authorization', generatedUsers.admin.token)
                .send(postData)
                .expect(status.BAD_REQUEST, done);
        });

        it('should not create with invalid data', (done) => {
            request.post('/api/events/' + events[0].id + '/purchasables')
                .set('Authorization', generatedUsers.admin.token)
                .send({
                    item: 'Blank'
                })
                .expect(status.BAD_REQUEST, done);
        });

        it('should require admin authorization', (done) => {
            request.post('/api/events/' + events[0].id + '/purchasables')
                .set('Authorization', generatedUsers.teacher.token)
                .expect(status.UNAUTHORIZED, done);
        });

        it('should not create for a bad event', (done) => {
            request.post('/api/events/' + badId + '/purchasables')
                .set('Authorization', generatedUsers.admin.token)
                .expect(status.BAD_REQUEST, done);
        });
    });

    describe('when purchasables exist', () => {
        let purchasableIds: number[];

        beforeEach(async () => {
            purchasableIds = [];
            await TestUtils.dropTable([Purchasable]);
        });

        beforeEach((done) => {
            async.series([
                (cb) => {
                    request.post('/api/events/' + events[0].id + '/purchasables')
                        .set('Authorization', generatedUsers.admin.token)
                        .send({
                            item: 'T-Shirt',
                            price: '15.00',
                            has_size: true
                        })
                        .expect(status.CREATED)
                        .end((err, res: SuperTestResponse<CreatePurchasablesResponseDto>) => {
                            if (err) { return done(err); }
                            purchasableIds.push(res.body.purchasables[0].id);
                            return cb();
                        });
                },
                (cb) => {
                    request.post('/api/events/' + events[0].id + '/purchasables')
                        .set('Authorization', generatedUsers.admin.token)
                        .send({
                            item: 'Badge',
                            price: '3.50'
                        })
                        .expect(status.CREATED)
                        .end((err, res: SuperTestResponse<CreatePurchasablesResponseDto>) => {
                            if (err) { return done(err); }
                            purchasableIds.push(res.body.purchasables[1].id);
                            return cb();
                        });
                },
                (cb) => {
                    request.post('/api/events/' + events[1].id + '/purchasables')
                        .set('Authorization', generatedUsers.admin.token)
                        .send({
                            item: 'T-Shirt',
                            price: '10.00',
                            has_size: true
                        })
                        .expect(status.CREATED)
                        .end((err, res: SuperTestResponse<CreatePurchasablesResponseDto>) => {
                            if (err) { return done(err); }
                            purchasableIds.push(res.body.purchasables[0].id);
                            return cb();
                        });
                },
                (cb) => {
                    request.post('/api/events/' + events[1].id + '/purchasables')
                        .set('Authorization', generatedUsers.admin.token)
                        .send({
                            item: 'Youth Lunch',
                            price: '10.00',
                            maximum_age: 10
                        })
                        .expect(status.CREATED)
                        .end((err, res: SuperTestResponse<CreatePurchasablesResponseDto>) => {
                            if (err) { return done(err); }
                            purchasableIds.push(res.body.purchasables[1].id);
                            return cb();
                        });
                }
            ], done);
        });

        describe('getting purchasables', () => {
            it('should show purchasables for an event', (done) => {
                request.get('/api/events/' + events[0].id + '/purchasables')
                    .expect(status.OK)
                    .end((err, res: SuperTestResponse<PurchasablesResponseDto>) => {
                        if (err) { return done(err); }
                        const purchasables = res.body;
                        expect(purchasables).to.have.length(2);
                        expect(purchasables[0].id).to.equal(purchasableIds[0]);
                        expect(purchasables[0].item).to.equal('T-Shirt');
                        expect(purchasables[0].has_size).to.be.true;
                        expect(purchasables[1].id).to.equal(purchasableIds[1]);
                        expect(purchasables[1].item).to.equal('Badge');
                        return done();
                    });
            });

            it('should get different purchasables for a second event', (done) => {
                request.get('/api/events/' + events[1].id + '/purchasables')
                    .expect(status.OK)
                    .end((err, res: SuperTestResponse<PurchasablesResponseDto>) => {
                        if (err) { return done(err); }
                        const purchasables = res.body;
                        expect(purchasables).to.have.length(2);
                        expect(purchasables[0].id).to.equal(purchasableIds[2]);
                        expect(purchasables[0].item).to.equal('T-Shirt');
                        expect(purchasables[0].has_size).to.be.true;
                        expect(purchasables[1].id).to.equal(purchasableIds[3]);
                        expect(purchasables[1].item).to.equal('Youth Lunch');
                        expect(purchasables[1].maximum_age).to.equal(10);
                        return done();
                    });
            });

            it('should include purchasables for all events', (done) => {
                request.get('/api/events/')
                    .expect(status.OK)
                    .end((err, res: SuperTestResponse<EventsResponseDto>) => {
                        if (err) { return done(err); }
                        const allEvents = res.body;
                        expect(allEvents).to.have.length(2);
                        expect(allEvents[0].purchasables).to.have.length(2);
                        expect(allEvents[1].purchasables).to.have.length(2);
                        return done();
                    });
            });

            it('should not get purchasables for a bad event', (done) => {
                request.get('/api/events/' + badId + '/purchasables')
                    .expect(status.BAD_REQUEST, done);
            });
        });

        describe('updating purchasables', () => {
            it('should update an existing purchasable', (done) => {
                request.put('/api/events/' + events[0].id + '/purchasables/' + purchasableIds[0])
                    .set('Authorization', generatedUsers.admin.token)
                    .send(<UpdatePurchasableDto>{
                        item: 'T-Shirt',
                        price: '10.00',
                        has_size: false
                    })
                    .expect(status.OK)
                    .end((err, res: SuperTestResponse<UpdatePurchasableResponseDto>) => {
                        if (err) { return done(err); }
                        const purchasable = res.body.purchasable;
                        expect(purchasable.id).to.equal(purchasableIds[0]);
                        expect(purchasable.item).to.equal('T-Shirt');
                        expect(purchasable.price).to.equal('10.00');
                        expect(purchasable.has_size).to.be.false;
                        return done();
                    });
            });

            it('should update an age requirement', (done) => {
                request.put('/api/events/' + events[1].id + '/purchasables/' + purchasableIds[3])
                    .set('Authorization', generatedUsers.admin.token)
                    .send(<UpdatePurchasableDto>{
                        maximum_age: 8
                    })
                    .expect(status.OK)
                    .end((err, res: SuperTestResponse<UpdatePurchasableResponseDto>) => {
                        if (err) { return done(err); }
                        const purchasable = res.body.purchasable;
                        expect(purchasable.id).to.equal(purchasableIds[3]);
                        expect(purchasable.item).to.equal('Youth Lunch');
                        expect(purchasable.maximum_age).to.equal(8);
                        return done();
                    });
            });

            it('should update with new information', (done) => {
                request.put('/api/events/' + events[0].id + '/purchasables/' + purchasableIds[0])
                    .set('Authorization', generatedUsers.admin.token)
                    .send(<UpdatePurchasableDto>{
                        item: 'T-Shirt',
                        description: 'New description',
                        price: '10.00'
                    })
                    .expect(status.OK)
                    .end((err, res: SuperTestResponse<UpdatePurchasableResponseDto>) => {
                        if (err) { return done(err); }
                        const purchasable = res.body.purchasable;
                        expect(purchasable.id).to.equal(purchasableIds[0]);
                        expect(purchasable.item).to.equal('T-Shirt');
                        expect(purchasable.description).to.equal('New description');
                        expect(purchasable.price).to.equal('10.00');
                        return done();
                    });

            });

            it('should not update without required fields', (done) => {
                request.put('/api/events/' + events[0].id + '/purchasables/' + purchasableIds[0])
                    .set('Authorization', generatedUsers.admin.token)
                    .send(<UpdatePurchasableDto>{
                        item: null,
                        price: '10.00'
                    })
                    .expect(status.BAD_REQUEST, done);
            });

            it('should not update for an invalid event', (done) => {
                request.put('/api/events/' + badId + '/purchasables/' + purchasableIds[0])
                    .set('Authorization', generatedUsers.admin.token)
                    .send(<UpdatePurchasableDto>{
                        item: 'T-Shirt',
                        price: '10.00'
                    })
                    .expect(status.BAD_REQUEST, done);
            });

            it('should not update for an invalid purchasable', (done) => {
                request.put('/api/events/' + events[0].id + '/purchasables/' + badId)
                    .set('Authorization', generatedUsers.admin.token)
                    .send(<UpdatePurchasableDto>{
                        item: 'T-Shirt',
                        price: '10.00'
                    })
                    .expect(status.BAD_REQUEST, done);
            });

            it('should require admin privileges', (done) => {
                request.put('/api/events/' + events[0].id + '/purchasables/' + purchasableIds[0])
                    .set('Authorization', generatedUsers.coordinator.token)
                    .expect(status.UNAUTHORIZED, done);
            });

            it('should not create invalid fields', (done) => {
                request.put('/api/events/' + events[0].id + '/purchasables/' + purchasableIds[0])
                    .set('Authorization', generatedUsers.admin.token)
                    .send(<UpdatePurchasableDto>{
                        item: 'T-Shirt',
                        invalid: 'invalid',
                        price: '10.00'
                    })
                    .expect(status.OK)
                    .end((err, res: SuperTestResponse<UpdatePurchasableResponseDto>) => {
                        if (err) { return done(err); }
                        const purchasable = res.body.purchasable;
                        expect((purchasable as any).invalid).to.not.exist;
                        return done();
                    });
            });
        });

        describe('deleting purchasables', () => {
            it('should delete purchasables from an event', (done) => {
                async.series([
                    (cb) => {
                        request.get('/api/events/' + events[0].id + '/purchasables')
                            .expect(status.OK)
                            .end((err, res: SuperTestResponse<PurchasablesResponseDto>) => {
                                if (err) { return done(err); }
                                expect(res.body).to.have.length(2);
                                return cb();
                            });
                    },
                    (cb) => {
                        request.del('/api/events/' + events[0].id + '/purchasables/' + purchasableIds[0])
                            .set('Authorization', generatedUsers.admin.token)
                            .expect(status.OK, cb);
                    },
                    (cb) => {
                        request.get('/api/events/' + events[0].id + '/purchasables')
                            .expect(status.OK)
                            .end((err, res: SuperTestResponse<PurchasablesResponseDto>) => {
                                if (err) { return done(err); }
                                expect(res.body).to.have.length(1);
                                expect(res.body[0].id).to.equal(purchasableIds[1]);
                                return cb();
                            });
                    }
                ], done);
            });

            it('should require admin privileges', (done) => {
                request.del('/api/events/' + events[0].id + '/purchasables/' + purchasableIds[0])
                    .set('Authorization', generatedUsers.coordinator.token)
                    .expect(status.UNAUTHORIZED, done);
            });

            it('should not delete from a bad event', (done) => {
                request.del('/api/events/' + badId + '/purchasables/' + purchasableIds[0])
                    .set('Authorization', generatedUsers.admin.token)
                    .expect(status.BAD_REQUEST, done);
            });

            it('should not delete a bad purchasable', (done) => {
                request.del('/api/events/' + events[0].id + '/purchasables/' + badId)
                    .set('Authorization', generatedUsers.admin.token)
                    .expect(status.BAD_REQUEST, done);
            });
        });

        describe('associating purchasables to a registration', () => {
            let purchasables: Purchasable[];
            let registrationIds: number[];

            beforeEach(async () => {
                await TestUtils.dropTable([Registration, Purchasable, Purchase, Scout]);
            });

            beforeEach(async () => {
                generatedScouts = await TestUtils.createScoutsForUser(generatedUsers.coordinator, testScouts(5));
            });

            beforeEach((done) => {
                scoutId = generatedScouts[0].id;
                registrationIds = [];
                async.series([
                    (cb) => {
                        request.post('/api/scouts/' + scoutId + '/registrations')
                            .set('Authorization', generatedUsers.coordinator.token)
                            .send(<RegistrationDto>{
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
                            .send(<RegistrationDto>{
                                event_id: events[1].id
                            })
                            .expect(status.CREATED)
                            .end((err, res: SuperTestResponse<CreateRegistrationResponseDto>) => {
                                if (err) { return done(err); }
                                registrationIds.push(res.body.registration.id);
                                return cb();
                            });
                    },
                    (cb) => {
                        request.post('/api/scouts/' + generatedScouts[1].id + '/registrations')
                            .set('Authorization', generatedUsers.coordinator.token)
                            .send(<RegistrationDto>{
                                event_id: events[0].id
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

            beforeEach(async () => {
                purchasables = await TestUtils.createPurchasablesForEvent(events[0]);
            });

            describe('creating a purchase', () => {
                it('should associate the purchasable to an event', (done) => {
                    const postData: CreatePurchaseRequestDto = {
                        purchasable: purchasables[1].id,
                        quantity: 3
                    };

                    request.post('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/purchases')
                        .set('Authorization', generatedUsers.coordinator.token)
                        .send(postData)
                        .expect(status.CREATED)
                        .end((err, res: SuperTestResponse<CreatePurchaseResponseDto>) => {
                            if (err) { return done(err); }
                            expect(res.body.registration.purchases).to.have.length(1);
                            const purchase = res.body.registration.purchases[0];
                            expect(purchase.id).to.equal(postData.purchasable);
                            expect(purchase.details.quantity).to.equal(postData.quantity);
                            expect(purchase.details.size).to.not.exist;
                            return done();
                        });
                });

                it('should allow a scout that is in the valid age range', (done) => {
                    let validPurchaseId: number;
                    async.series([
                        (cb) => {
                            const postData: CreatePurchasableDto = {
                                item: 'Adult Lunch With Age',
                                price: '12.00',
                                minimum_age: 0
                            };

                            request.post('/api/events/' + events[0].id + '/purchasables')
                                .set('Authorization', generatedUsers.admin.token)
                                .send(postData)
                                .expect(status.CREATED)
                                .end((err, res: SuperTestResponse<CreatePurchasablesResponseDto>) => {
                                    if (err) { return done(err); }
                                    expect(res.body.purchasables[4].item).to.equal(postData.item);
                                    validPurchaseId = res.body.purchasables[4].id;
                                    return cb();
                                });
                        },
                        (cb) => {
                            const postData: CreatePurchaseRequestDto = {
                                purchasable: validPurchaseId
                            };

                            request.post('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/purchases')
                                .set('Authorization', generatedUsers.coordinator.token)
                                .send(postData)
                                .expect(status.CREATED, cb);
                        }
                    ], done);
                });

                xit('should allow scouts to purchase an item multiple times', (done) => {
                    const postData: CreatePurchaseRequestDto = {
                        purchasable: purchasables[1].id,
                        quantity: 3
                    };

                    async.series([
                        (cb) => {
                            request.post('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/purchases')
                                .set('Authorization', generatedUsers.coordinator.token)
                                .send(postData)
                                .expect(status.CREATED, cb);
                        },
                        (cb) => {
                            request.post('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/purchases')
                                .set('Authorization', generatedUsers.coordinator.token)
                                .send(postData)
                                .expect(status.CREATED, cb);
                        },
                        (cb) => {
                            request.get('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/purchases')
                                .set('Authorization', generatedUsers.coordinator.token)
                                .expect(status.OK)
                                .end((err, res) => {
                                    if (err) { return done(err); }
                                    const purchases = res.body;
                                    expect(purchases).to.have.length(2);
                                    return cb();
                                });
                        }
                    ], done);
                });

                xit('should not allow a scout that is too old to purchase', (done) => {
                    let invalidPurchaseId: number;
                    async.series([
                        (cb) => {
                            const postData: CreatePurchasableDto = {
                                item: 'Youth Lunch With Age',
                                price: '12.00',
                                maximum_age: 0
                            };

                            request.post('/api/events/' + events[0].id + '/purchasables')
                                .set('Authorization', generatedUsers.admin.token)
                                .send(postData)
                                .expect(status.CREATED)
                                .end((err, res) => {
                                    if (err) { return done(err); }
                                    expect(res.body.purchasables[4].item).to.equal(postData.item);
                                    invalidPurchaseId = res.body.purchasables[4].id;
                                    return cb();
                                });
                        },
                        (cb) => {
                            const postData: CreatePurchaseRequestDto = {
                                purchasable: invalidPurchaseId
                            };

                            request.post('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/purchases')
                                .set('Authorization', generatedUsers.coordinator.token)
                                .send(postData)
                                .expect(status.BAD_REQUEST, cb);
                        }
                    ], done);
                });

                it('should default to 0 for quantity', (done) => {
                    const postData: CreatePurchaseRequestDto = {
                        purchasable: purchasables[0].id
                    };

                    request.post('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/purchases')
                        .set('Authorization', generatedUsers.coordinator.token)
                        .send(postData)
                        .expect(status.CREATED)
                        .end((err, res: SuperTestResponse<CreatePurchaseResponseDto>) => {
                            if (err) { return done(err); }
                            expect(res.body.registration.purchases).to.have.length(1);
                            const purchase = res.body.registration.purchases[0];
                            expect(purchase.id).to.equal(postData.purchasable);
                            expect(purchase.details.quantity).to.equal(0);
                            expect(purchase.details.size).to.not.exist;
                            return done();
                        });
                });

                it('should accept a size', (done) => {
                    const postData: CreatePurchaseRequestDto = {
                        purchasable: purchasables[0].id,
                        size: Size.L,
                        quantity: 2
                    };

                    request.post('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/purchases')
                        .set('Authorization', generatedUsers.coordinator.token)
                        .send(postData)
                        .expect(status.CREATED)
                        .end((err, res: SuperTestResponse<CreatePurchaseResponseDto>) => {
                            if (err) { return done(err); }
                            expect(res.body.registration.purchases).to.have.length(1);
                            const purchase = res.body.registration.purchases[0];
                            expect(purchase.id).to.equal(postData.purchasable);
                            expect(purchase.details.quantity).to.equal(postData.quantity);
                            expect(purchase.details.size).to.equal(postData.size);
                            return done();
                        });
                });

                it('should check for the scouts owner', (done) => {
                    const postData: CreatePurchaseRequestDto = {
                        purchasable: purchasables[0].id,
                        size: Size.L,
                        quantity: 2
                    };

                    request.post('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/purchases')
                        .set('Authorization', generatedUsers.coordinator2.token)
                        .send(postData)
                        .expect(status.UNAUTHORIZED, done);
                });

                it('should not allow teachers to create', (done) => {
                    const postData: CreatePurchaseRequestDto = {
                        purchasable: purchasables[0].id,
                        size: Size.L,
                        quantity: 2
                    };

                    request.post('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/purchases')
                        .set('Authorization', generatedUsers.teacher.token)
                        .send(postData)
                        .expect(status.UNAUTHORIZED, done);
                });

                it('should allow admins to create', (done) => {
                    const postData: CreatePurchaseRequestDto = {
                        purchasable: purchasables[0].id,
                        size: Size.L,
                        quantity: 2
                    };

                    request.post('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/purchases')
                        .set('Authorization', generatedUsers.admin.token)
                        .send(postData)
                        .expect(status.CREATED, done);
                });

                it('should not create for a nonexistant purchasable', (done) => {
                    const postData: CreatePurchaseRequestDto = {
                        purchasable: TestUtils.badId as any,
                        quantity: 1
                    };

                    request.post('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/purchases')
                        .set('Authorization', generatedUsers.coordinator.token)
                        .send(postData)
                        .expect(status.BAD_REQUEST, done);
                });

                it('should not create for a nonexistant registration', (done) => {
                    const postData: CreatePurchaseRequestDto = {
                        purchasable: purchasables[0].id,
                        quantity: 1
                    };

                    request.post('/api/scouts/' + scoutId + '/registrations/' + TestUtils.badId + '/purchases')
                        .set('Authorization', generatedUsers.coordinator.token)
                        .send(postData)
                        .expect(status.BAD_REQUEST, done);
                });

                it('should not create for a nonexistant scout', (done) => {
                    const postData: CreatePurchaseRequestDto = {
                        purchasable: purchasables[0].id,
                        quantity: 1
                    };

                    request.post('/api/scouts/' + TestUtils.badId + '/registrations/' + registrationIds[0] + '/purchases')
                        .set('Authorization', generatedUsers.coordinator.token)
                        .send(postData)
                        .expect(status.BAD_REQUEST, done);
                });
            });

            describe('when purchases already exist', () => {
                beforeEach((done) => {
                    async.series([
                        (cb) => {
                            request.post('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/purchases')
                                .set('Authorization', generatedUsers.coordinator.token)
                                .send(<CreatePurchaseRequestDto>{
                                    purchasable: purchasables[0].id,
                                    size: 'l',
                                    quantity: 2
                                })
                                .expect(status.CREATED, cb);
                        },
                        (cb) => {
                            request.post('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/purchases')
                                .set('Authorization', generatedUsers.coordinator.token)
                                .send(<CreatePurchaseRequestDto>{
                                    purchasable: purchasables[1].id,
                                    quantity: 1
                                })
                                .expect(status.CREATED, cb);
                        },
                        (cb) => {
                            request.post('/api/scouts/' + scoutId + '/registrations/' + registrationIds[1] + '/purchases')
                                .set('Authorization', generatedUsers.coordinator.token)
                                .send(<CreatePurchaseRequestDto>{
                                    purchasable: purchasables[3].id,
                                    quantity: 5
                                })
                                .expect(status.CREATED, cb);
                        },
                        (cb) => {
                            request.post('/api/scouts/' + generatedScouts[1].id + '/registrations/' + registrationIds[2] + '/purchases')
                                .set('Authorization', generatedUsers.coordinator.token)
                                .send(<CreatePurchaseRequestDto>{
                                    purchasable: purchasables[0].id,
                                    quantity: 5
                                })
                                .expect(status.CREATED, cb);
                        },
                        (cb) => {
                            request.post('/api/scouts/' + generatedScouts[1].id + '/registrations/' + registrationIds[2] + '/purchases')
                                .set('Authorization', generatedUsers.coordinator.token)
                                .send(<CreatePurchaseRequestDto>{
                                    purchasable: purchasables[3].id,
                                    quantity: 5
                                })
                                .expect(status.CREATED, cb);
                        }
                    ], done);
                });

                describe('getting purchases', () => {
                    it('should get all purchases for a registration', (done) => {
                        request.get('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/purchases')
                            .set('Authorization', generatedUsers.coordinator.token)
                            .expect(status.OK)
                            .end((err, res: SuperTestResponse<ScoutPurchasesResponseDto>) => {
                                if (err) { return done(err); }
                                const purchases = res.body;
                                expect(purchases).to.have.length(2);
                                expect(purchases[0].id).to.equal(purchasables[0].id);
                                expect(purchases[0].details.size).to.equal('l');
                                expect(purchases[0].details.quantity).to.equal(2);
                                expect(purchases[1].id).to.equal(purchasables[1].id);
                                expect(purchases[1].details.quantity).to.equal(1);
                                expect(purchases[1].details.size).to.not.exist;
                                return done();
                            });
                    });

                    it('should not get with an incorrect scout', (done) => {
                        request.get('/api/scouts/' + badId + '/registrations/' + registrationIds[0] + '/purchases')
                            .set('Authorization', generatedUsers.coordinator.token)
                            .expect(status.BAD_REQUEST, done);
                    });

                    it('should not get with an incorrect registration', (done) => {
                        request.get('/api/scouts/' + generatedScouts[0].id + '/registrations/' + badId + '/purchases')
                            .set('Authorization', generatedUsers.coordinator.token)
                            .expect(status.BAD_REQUEST, done);
                    });

                    it('should get the buyers of an item', async () => {
                        await request.get(`/api/events/${events[0].id}/purchasables/${purchasables[0].id}/buyers`)
                            .set('Authorization', generatedUsers.admin.token)
                            .expect(status.OK)
                            .then((res: SuperTestResponse<BuyersResponseDto>) => {
                                expect(res.body).to.have.length(2);
                                const buyers = res.body;
                                expect(buyers[0].scout.firstname).to.equal(generatedScouts[0].firstname);
                                expect(buyers[0].purchases).to.have.length(1);
                                expect(buyers[0].purchases[0].item).to.equal(purchasables[0].item);
                                expect(buyers[0].purchases[0].details.quantity).to.equal(2);
                                expect(buyers[1].scout.firstname).to.equal(generatedScouts[1].firstname);
                                expect(buyers[1].purchases).to.have.length(1);
                                expect(buyers[1].purchases[0].item).to.equal(purchasables[0].item);
                                expect(buyers[1].purchases[0].details.quantity).to.equal(5);
                            });

                        await request.get(`/api/events/${events[0].id}/purchasables/${purchasables[1].id}/buyers`)
                            .set('Authorization', generatedUsers.admin.token)
                            .expect(status.OK)
                            .then((res: SuperTestResponse<BuyersResponseDto>) => {
                                expect(res.body).to.have.length(1);
                                const buyers = res.body;
                                expect(buyers[0].scout.firstname).to.equal(generatedScouts[0].firstname);
                                expect(buyers[0].purchases).to.have.length(1);
                                expect(buyers[0].purchases[0].item).to.equal(purchasables[1].item);
                                expect(buyers[0].purchases[0].details.quantity).to.equal(1);
                            });

                    });

                    it('should not get buyers for an invalid item', async () => {
                        await request.get(`/api/events/${events[0].id}/purchasables/${badId}/buyers`)
                            .set('Authorization', generatedUsers.admin.token)
                            .expect(status.OK)
                            .then((res: SuperTestResponse<BuyersResponseDto>) => {
                                expect(res.body).to.have.length(0);
                            });
                    });

                    it('should not allow coordinators to get buyers', async () => {
                        await request.get(`/api/events/${events[0].id}/purchasables/${purchasables[0].id}/buyers`)
                            .set('Authorization', generatedUsers.coordinator.token)
                            .expect(status.UNAUTHORIZED);
                    });
                });

                describe('updating purchases', () => {
                    it('should update a purchase', (done) => {
                        async.series([
                            (cb) => {
                                request.get('/api/scouts/' + generatedScouts[0].id + '/registrations/' + registrationIds[0] + '/purchases')
                                    .set('Authorization', generatedUsers.coordinator.token)
                                    .expect(status.OK)
                                    .end((err, res: SuperTestResponse<ScoutPurchasesResponseDto>) => {
                                        if (err) { return done(err); }
                                        expect(res.body[0].details.quantity).to.equal(2);
                                        return cb();
                                    });
                            },
                            (cb) => {
                                request.put('/api/scouts/' + generatedScouts[0].id + '/registrations/' + registrationIds[0] +
                                    '/purchases/' + purchasables[0].id)
                                    .set('Authorization', generatedUsers.coordinator.token)
                                    .send(<CreatePurchaseRequestDto>{
                                        quantity: 1
                                    })
                                    .expect(status.OK, cb);
                            },
                            (cb) => {
                                request.get('/api/scouts/' + generatedScouts[0].id + '/registrations/' + registrationIds[0] + '/purchases')
                                    .set('Authorization', generatedUsers.coordinator.token)
                                    .expect(status.OK)
                                    .end((err, res: SuperTestResponse<ScoutPurchasesResponseDto>) => {
                                        if (err) { return done(err); }
                                        expect(res.body[0].details.quantity).to.equal(1);
                                        return cb();
                                    });
                            }
                        ], done);
                    });

                    it('should check for the scouts owner', (done) => {
                        request.put('/api/scouts/' + generatedScouts[0].id + '/registrations/' + registrationIds[0] +
                            '/purchases/' + purchasables[0].id)
                            .set('Authorization', generatedUsers.coordinator2.token)
                            .send(<CreatePurchaseRequestDto>{
                                quantity: 1
                            })
                            .expect(status.UNAUTHORIZED, done);
                    });

                    it('should not allow teachers to update', (done) => {
                        request.put('/api/scouts/' + generatedScouts[0].id + '/registrations/' + registrationIds[0] +
                            '/purchases/' + purchasables[0].id)
                            .set('Authorization', generatedUsers.teacher.token)
                            .send(<CreatePurchaseRequestDto>{
                                quantity: 1
                            })
                            .expect(status.UNAUTHORIZED, done);
                    });

                    it('should allow admins to update', (done) => {
                        request.put('/api/scouts/' + generatedScouts[0].id + '/registrations/' + registrationIds[0] +
                            '/purchases/' + purchasables[0].id)
                            .set('Authorization', generatedUsers.admin.token)
                            .send(<CreatePurchaseRequestDto>{
                                quantity: 1
                            })
                            .expect(status.OK, done);
                    });

                    it('should not update an invalid purchase', (done) => {
                        request.put('/api/scouts/' + generatedScouts[0].id + '/registrations/' + registrationIds[0] +
                            '/purchases/' + TestUtils.badId)
                            .set('Authorization', generatedUsers.coordinator.token)
                            .send(<CreatePurchaseRequestDto>{
                                quantity: 1
                            })
                            .expect(status.BAD_REQUEST, done);
                    });

                    it('should not update an invalid registration', (done) => {
                        request.put('/api/scouts/' + generatedScouts[0].id + '/registrations/' + TestUtils.badId +
                            '/purchases/' + purchasables[0].id)
                            .set('Authorization', generatedUsers.coordinator.token)
                            .send(<CreatePurchaseRequestDto>{
                                quantity: 1
                            })
                            .expect(status.BAD_REQUEST, done);
                    });

                    it('should not update an invalid scout', (done) => {
                        request.put('/api/scouts/' + TestUtils.badId + '/registrations/' + registrationIds[0] +
                            '/purchases/' + purchasables[0].id)
                            .set('Authorization', generatedUsers.coordinator.token)
                            .send(<CreatePurchaseRequestDto>{
                                quantity: 1
                            })
                            .expect(status.BAD_REQUEST, done);
                    });

                    it('should not update a purchase for the wrong registration', (done) => {
                        request.put('/api/scouts/' + generatedScouts[0].id + '/registrations/' + registrationIds[0] +
                            '/purchases/' + purchasables[3].id)
                            .set('Authorization', generatedUsers.coordinator.token)
                            .send(<CreatePurchaseRequestDto>{
                                quantity: 1
                            })
                            .expect(status.BAD_REQUEST, done);
                    });

                    it('should not allow a required value to be unset', (done) => {
                        request.put('/api/scouts/' + generatedScouts[0].id + '/registrations/' + registrationIds[0] +
                            '/purchases/' + purchasables[0].id)
                            .set('Authorization', generatedUsers.coordinator.token)
                            .send(<CreatePurchaseRequestDto>{
                                quantity: null
                            })
                            .expect(status.BAD_REQUEST, done);
                    });
                });

                describe('deleting purchases', () => {
                    it('should delete a purchase', (done) => {
                        async.series([
                            (cb) => {
                                request.get('/api/scouts/' + generatedScouts[0].id + '/registrations/' + registrationIds[0] + '/purchases')
                                    .set('Authorization', generatedUsers.coordinator.token)
                                    .expect(status.OK)
                                    .end((err, res: SuperTestResponse<ScoutPurchasesResponseDto>) => {
                                        if (err) { return done(err); }
                                        expect(res.body).to.have.length(2);
                                        return cb();
                                    });
                            },
                            (cb) => {
                                request.del('/api/scouts/' + generatedScouts[0].id + '/registrations/' + registrationIds[0] +
                                    '/purchases/' + purchasables[0].id)
                                    .set('Authorization', generatedUsers.coordinator.token)
                                    .expect(status.OK, cb);
                            },
                            (cb) => {
                                request.get('/api/scouts/' + generatedScouts[0].id + '/registrations/' + registrationIds[0] + '/purchases')
                                    .set('Authorization', generatedUsers.coordinator.token)
                                    .expect(status.OK)
                                    .end((err, res: SuperTestResponse<ScoutPurchasesResponseDto>) => {
                                        if (err) { return done(err); }
                                        expect(res.body).to.have.length(1);
                                        return cb();
                                    });
                            }
                        ], done);
                    });

                    it('should check for the scouts owner', (done) => {
                        request.del('/api/scouts/' + generatedScouts[0].id + '/registrations/' + registrationIds[0] +
                            '/purchases/' + purchasables[0].id)
                            .set('Authorization', generatedUsers.coordinator2.token)
                            .expect(status.UNAUTHORIZED, done);
                    });

                    it('should not allow teachers to delete', (done) => {
                        request.del('/api/scouts/' + generatedScouts[0].id + '/registrations/' + registrationIds[0] +
                            '/purchases/' + purchasables[0].id)
                            .set('Authorization', generatedUsers.teacher.token)
                            .expect(status.UNAUTHORIZED, done);
                    });

                    it('should allow admins to delete', (done) => {
                        request.del('/api/scouts/' + generatedScouts[0].id + '/registrations/' + registrationIds[0] +
                            '/purchases/' + purchasables[0].id)
                            .set('Authorization', generatedUsers.admin.token)
                            .expect(status.OK, done);
                    });

                    it('should not delete an invalid purchase', (done) => {
                        request.del('/api/scouts/' + generatedScouts[0].id + '/registrations/' + registrationIds[0] +
                            '/purchases/' + TestUtils.badId)
                            .set('Authorization', generatedUsers.coordinator.token)
                            .expect(status.BAD_REQUEST, done);
                    });

                    it('should not delete an invalid registration', (done) => {
                        request.del('/api/scouts/' + generatedScouts[0].id + '/registrations/' + TestUtils.badId +
                            '/purchases/' + purchasables[0].id)
                            .set('Authorization', generatedUsers.coordinator.token)
                            .expect(status.BAD_REQUEST, done);
                    });

                    it('should not delete an invalid scout', (done) => {
                        request.del('/api/scouts/' + TestUtils.badId + '/registrations/' + registrationIds[0] +
                            '/purchases/' + purchasables[0].id)
                            .set('Authorization', generatedUsers.coordinator.token)
                            .expect(status.BAD_REQUEST, done);
                    });

                    it('should not delete a purchase for the wrong registration', (done) => {
                        request.del('/api/scouts/' + generatedScouts[0].id + '/registrations/' + registrationIds[0] +
                            '/purchases/' + purchasables[3].id)
                            .set('Authorization', generatedUsers.coordinator.token)
                            .expect(status.BAD_REQUEST, done);
                    });
                });

                describe.only('when an associated purchasable is deleted', () => {
                    it('should delete associated purchases', async () => {
                        await request.get('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/purchases')
                            .set('Authorization', generatedUsers.coordinator.token)
                            .expect(status.OK)
                            .then((res: SuperTestResponse<ScoutPurchasesResponseDto>) => {
                                expect(res.body).to.have.length(2);
                            });

                        await request.del('/api/events/' + events[0].id + '/purchasables/' + purchasableIds[0])
                            .set('Authorization', generatedUsers.admin.token)
                            .expect(status.OK);

                        await request.get('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/purchases')
                            .set('Authorization', generatedUsers.coordinator.token)
                            .expect(status.OK)
                            .then((res: SuperTestResponse<ScoutPurchasesResponseDto>) => {
                                expect(res.body).to.have.length(1);
                            });
                    });
                });
            });
        });
    });
});
