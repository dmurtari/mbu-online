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
import { OfferingInterface } from '@interfaces/offering.interface';
import { Registration } from '@models/registration.model';
import { Assignment } from '@models/assignment.model';
import testScouts from './testScouts';
import { CreateAssignmentRequestDto, CreateAssignmentResponseDto, ScoutAssignmentResponseDto, UpdateAssignmentResponseDto } from '@interfaces/assignment.interface';
import { SuperTestResponse } from '@test/helpers/supertest.interface';

const request = supertest(app);

describe('assignments', () => {
    let badges: Badge[];
    let events: Event[];
    let generatedUsers: RoleTokenObjects;
    let generatedScouts: Scout[];
    let generatedOfferings: Offering[];
    let scoutId: string;
    let registrationIds: string[];

    const badId = TestUtils.badId;
    const defaultRequirements: string[] = ['1', '2', '3a'];

    beforeAll(async () => {
        await TestUtils.dropDb();
    });

    beforeAll(async () => {
        generatedUsers = await TestUtils.generateTokens();
        badges = await TestUtils.createBadges();
        events = await TestUtils.createEvents();

        const defaultPostData: OfferingInterface = {
            price: 10,
            periods: [1, 2, 3],
            duration: 1,
            requirements: defaultRequirements
        };

        generatedOfferings = await TestUtils.createOfferingsForEvent(events[0], badges, defaultPostData);
    });

    beforeEach(async () => {
        await TestUtils.dropTable([Registration, Assignment]);
        generatedScouts = await TestUtils.createScoutsForUser(generatedUsers.coordinator, testScouts(5));
    });

    beforeEach((done) => {
        scoutId = generatedScouts[0].id;
        registrationIds = [];
        async.series([
            (cb) => {
                request.post('/api/scouts/' + scoutId + '/registrations')
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
            },
            (cb) => {
                request.post('/api/scouts/' + scoutId + '/registrations')
                    .set('Authorization', generatedUsers.coordinator.token)
                    .send({
                        event_id: events[1].id
                    })
                    .expect(status.CREATED)
                    .end((err, res) => {
                        if (err) { return done(err); }
                        registrationIds.push(res.body.registration.id);
                        return cb();
                    });
            }
        ], done);
    });

    afterAll(async () => {
        await TestUtils.dropDb();
        await TestUtils.closeDb();
    });

    describe('when assignments do not exist', () => {
        test('should be able to assign a scout to an offering', (done) => {
            const postData: CreateAssignmentRequestDto = {
                periods: [1],
                offering: generatedOfferings[1].id
            };

            request.post('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/assignments')
                .set('Authorization', generatedUsers.teacher.token)
                .send(postData)
                .expect(status.CREATED)
                .end((err, res: SuperTestResponse<CreateAssignmentResponseDto>) => {
                    if (err) { return done(err); }
                    const registration = res.body.registration;
                    expect(registration.assignments).to.have.length(1);
                    const assignment = registration.assignments[0];
                    expect(assignment.offering_id).to.equal(postData.offering);
                    expect(assignment.details.periods).to.deep.equal(postData.periods);
                    return done();
                });
        });

        test('should create a blank object of completions', (done) => {
            const postData: CreateAssignmentRequestDto = {
                periods: [1],
                offering: generatedOfferings[1].id
            };

            request.post('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/assignments')
                .set('Authorization', generatedUsers.teacher.token)
                .send(postData)
                .expect(status.CREATED)
                .end((err, res: SuperTestResponse<CreateAssignmentResponseDto>) => {
                    if (err) { return done(err); }
                    const registration = res.body.registration;
                    expect(registration.assignments).to.have.length(1);
                    const assignment = registration.assignments[0];
                    expect(assignment.offering_id).to.equal(postData.offering);
                    expect(assignment.details.completions).to.deep.equal([]);
                    expect(assignment.details.periods).to.deep.equal(postData.periods);
                    return done();
                });
        });

        test('should be able to batch assign to offerings', (done) => {
            const postData: CreateAssignmentRequestDto[] = [{
                periods: [1],
                offering: generatedOfferings[0].id
            }, {
                periods: [2],
                offering: generatedOfferings[1].id
            }, {
                periods: [3],
                offering: generatedOfferings[2].id
            }];

            request.post('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/assignments')
                .set('Authorization', generatedUsers.admin.token)
                .send(postData)
                .expect(status.CREATED)
                .end((err, res: SuperTestResponse<CreateAssignmentResponseDto>) => {
                    if (err) { return done(err); }
                    const registration = res.body.registration;
                    expect(registration.assignments).to.have.lengthOf(3);
                    registration.assignments.forEach((assignment: any, index: number) => {
                        expect(assignment.details.periods).to.deep.equal(postData[index].periods);
                        expect(assignment.offering_id).to.equal(postData[index].offering);
                        expect(assignment.price).to.exist;
                        expect(assignment.badge.name).to.exist;
                    });
                    return done();
                });
        });

        test('should allow an empty period', (done) => {
            const postData: CreateAssignmentRequestDto[] = [{
                periods: [2],
                offering: generatedOfferings[1].id
            }, {
                periods: [3],
                offering: generatedOfferings[2].id
            }];

            request.post('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/assignments')
                .set('Authorization', generatedUsers.admin.token)
                .send(postData)
                .expect(status.CREATED)
                .end((err, res: SuperTestResponse<CreateAssignmentResponseDto>) => {
                    if (err) { return done(err); }
                    const registration = res.body.registration;
                    expect(registration.assignments).to.have.lengthOf(2);
                    registration.assignments.forEach((assignment: any, index: number) => {
                        expect(assignment.details.periods).to.deep.equal(postData[index].periods);
                        expect(assignment.offering_id).to.equal(postData[index].offering);
                        expect(assignment.price).to.exist;
                        expect(assignment.badge.name).to.exist;
                    });
                    return done();
                });
        });

        test('should not allow coordinators to access', (done) => {
            const postData: CreateAssignmentRequestDto = {
                periods: [1],
                offering: generatedOfferings[1].id
            };

            request.post('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/assignments')
                .set('Authorization', generatedUsers.coordinator.token)
                .send(postData)
                .expect(status.UNAUTHORIZED, done);
        });

        test('should not create for a nonexistant offering', (done) => {
            const postData: any = {
                offering: badId,
                periods: [1]
            };

            request.post('/api/scouts/' + generatedScouts[0].id + '/registrations/' +
                registrationIds[0] + '/assignments')
                .set('Authorization', generatedUsers.teacher.token)
                .send(postData)
                .expect(status.BAD_REQUEST, done);
        });

        test('should not create for nonexistant registrations', (done) => {
            const postData: CreateAssignmentRequestDto = {
                offering: generatedOfferings[0].id,
                periods: [1]
            };

            request.post('/api/scouts/' + generatedScouts[0].id + '/registrations/' +
                badId + '/assignments')
                .set('Authorization', generatedUsers.teacher.token)
                .send(postData)
                .expect(status.BAD_REQUEST, done);
        });
    });

    describe('when assignments exist', () => {
        beforeEach((done) => {
            async.series([
                (cb) => {
                    request.post('/api/scouts/' + generatedScouts[0].id + '/registrations/' +
                        registrationIds[0] + '/assignments')
                        .set('Authorization', generatedUsers.teacher.token)
                        .send(<CreateAssignmentRequestDto>{
                            offering: generatedOfferings[0].id,
                            periods: [1]
                        })
                        .expect(status.CREATED, cb);
                },
                (cb) => {
                    request.post('/api/scouts/' + generatedScouts[0].id + '/registrations/' +
                        registrationIds[0] + '/assignments')
                        .set('Authorization', generatedUsers.teacher.token)
                        .send(<CreateAssignmentRequestDto>{
                            offering: generatedOfferings[1].id,
                            periods: [2, 3]
                        })
                        .expect(status.CREATED, cb);
                },
                (cb) => {
                    request.post('/api/scouts/' + generatedScouts[0].id + '/registrations/' +
                        registrationIds[1] + '/assignments')
                        .set('Authorization', generatedUsers.teacher.token)
                        .send(<CreateAssignmentRequestDto>{
                            offering: generatedOfferings[0].id,
                            periods: [3]
                        })
                        .expect(status.CREATED, cb);
                }
            ], done);
        });

        describe('getting assignments', () => {
            test('should get all assignments for a registration', (done) => {
                request.get('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/assignments')
                    .set('Authorization', generatedUsers.teacher.token)
                    .expect(status.OK)
                    .end((err, res: SuperTestResponse<ScoutAssignmentResponseDto>) => {
                        if (err) { return done(err); }
                        const assignments = res.body;
                        expect(assignments).to.have.length(2);
                        expect(assignments[0].offering_id).to.equal(generatedOfferings[0].id);
                        expect(assignments[0].details.periods).to.deep.equal([1]);
                        expect(assignments[0].details.completions).to.exist;
                        expect(assignments[1].offering_id).to.equal(generatedOfferings[1].id);
                        expect(assignments[1].details.periods).to.deep.equal([2, 3]);
                        expect(assignments[1].details.completions).to.exist;
                        return done();
                    });
            });

            test('should not get with an incorrect scout', (done) => {
                request.get('/api/scouts/' + badId + '/registrations/' + registrationIds[0] + '/assignments')
                    .set('Authorization', generatedUsers.teacher.token)
                    .expect(status.BAD_REQUEST, done);
            });

            test('should not get with an incorrect registration', (done) => {
                request.get('/api/scouts/' + generatedScouts[0].id + '/registrations/' + badId + '/assignments')
                    .set('Authorization', generatedUsers.teacher.token)
                    .expect(status.BAD_REQUEST, done);
            });
        });

        describe('updating assignments', () => {
            test('should update a assignment periods', (done) => {
                async.series([
                    (cb) => {
                        request.get('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/assignments')
                            .set('Authorization', generatedUsers.teacher.token)
                            .expect(status.OK)
                            .end((err, res: SuperTestResponse<ScoutAssignmentResponseDto>) => {
                                if (err) { return done(err); }
                                expect(res.body[0].offering_id).to.exist;
                                expect(res.body[0].details.periods).to.deep.equal([1]);
                                return cb();
                            });
                    },
                    (cb) => {
                        request.put('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/assignments/'
                            + generatedOfferings[0].id)
                            .set('Authorization', generatedUsers.teacher.token)
                            .send({
                                periods: [2]
                            })
                            .expect(status.OK)
                            .end((err, res: SuperTestResponse<UpdateAssignmentResponseDto>) => {
                                if (err) { return done(err); }
                                expect(res.body.assignment.periods).to.deep.equal([2]);
                                return cb();
                            });
                    },
                    (cb) => {
                        request.get('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/assignments')
                            .set('Authorization', generatedUsers.teacher.token)
                            .expect(status.OK)
                            .end((err, res: SuperTestResponse<ScoutAssignmentResponseDto>) => {
                                expect(res.body[0].offering_id).to.exist;
                                expect(res.body[0].details.periods).to.deep.equal([2]);
                                return cb();
                            });
                    },
                ], done);
            });

            test('should overwrite assignments with a batch', (done) => {
                const postData: CreateAssignmentRequestDto[] = [{
                    periods: [1],
                    offering: generatedOfferings[0].id
                }, {
                    periods: [2],
                    offering: generatedOfferings[1].id
                }, {
                    periods: [3],
                    offering: generatedOfferings[2].id
                }];

                request.post('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/assignments')
                    .set('Authorization', generatedUsers.admin.token)
                    .send(postData)
                    .expect(status.CREATED)
                    .end((err, res: SuperTestResponse<CreateAssignmentResponseDto>) => {
                        if (err) { return done(err); }
                        const registration = res.body.registration;
                        expect(registration.assignments).to.have.lengthOf(3);
                        registration.assignments.forEach((assignment: any, index: number) => {
                            expect(assignment.details.periods).to.deep.equal(postData[index].periods);
                            expect(assignment.offering_id).to.equal(postData[index].offering);
                            expect(assignment.price).to.exist;
                            expect(assignment.badge.name).to.exist;
                        });
                        return done();
                    });
            });

            test('should allow overwriting with empty values for a period', (done) => {
                const postData: CreateAssignmentRequestDto[] = [{
                    periods: [2],
                    offering: generatedOfferings[1].id
                }, {
                    periods: [3],
                    offering: generatedOfferings[2].id
                }];

                request.post('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/assignments')
                    .set('Authorization', generatedUsers.admin.token)
                    .send(postData)
                    .expect(status.CREATED)
                    .end((err, res: SuperTestResponse<CreateAssignmentResponseDto>) => {
                        if (err) { return done(err); }
                        const registration = res.body.registration;
                        expect(registration.assignments).to.have.lengthOf(2);
                        registration.assignments.forEach((assignment: any, index: number) => {
                            expect(assignment.details.periods).to.deep.equal(postData[index].periods);
                            expect(assignment.offering_id).to.equal(postData[index].offering);
                            expect(assignment.price).to.exist;
                            expect(assignment.badge.name).to.exist;
                        });
                        return done();
                    });
            });

            test('should not update an invalid assignment', (done) => {
                request.put('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/assignments/' + badId)
                    .set('Authorization', generatedUsers.teacher.token)
                    .expect(status.BAD_REQUEST, done);
            });

            test('should not update an invalid registration', (done) => {
                request.put('/api/scouts/' + scoutId + '/registrations/' + badId + '/assignments/' + generatedOfferings[0].id)
                    .set('Authorization', generatedUsers.teacher.token)
                    .expect(status.BAD_REQUEST, done);
            });

            test('should not update for an invalid scout', (done) => {
                request.put('/api/scouts/' + badId + '/registrations/' + registrationIds[0] + '/assignments/' + generatedOfferings[0].id)
                    .set('Authorization', generatedUsers.teacher.token)
                    .expect(status.BAD_REQUEST, done);
            });
        });

        describe('deleting assignments', () => {
            test('should delete an existing assignment', (done) => {
                async.series([
                    (cb) => {
                        request.get('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/assignments')
                            .set('Authorization', generatedUsers.teacher.token)
                            .expect(status.OK)
                            .end((err, res: SuperTestResponse<ScoutAssignmentResponseDto>) => {
                                if (err) { return done(err); }
                                expect(res.body).to.have.length(2);
                                return cb();
                            });
                    },
                    (cb) => {
                        request.del('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/assignments/' +
                            generatedOfferings[0].id)
                            .set('Authorization', generatedUsers.teacher.token)
                            .expect(status.OK, cb);
                    },
                    (cb) => {
                        request.get('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/assignments')
                            .set('Authorization', generatedUsers.teacher.token)
                            .expect(status.OK)
                            .end((err, res: SuperTestResponse<ScoutAssignmentResponseDto>) => {
                                expect(res.body).to.have.length(1);
                                return cb();
                            });
                    },
                ], done);
            });

            test('should not delete an invalid assignment', (done) => {
                request.del('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/assignments/' + badId)
                    .set('Authorization', generatedUsers.teacher.token)
                    .expect(status.BAD_REQUEST, done);
            });

            test('should not delete an invalid registration', (done) => {
                request.del('/api/scouts/' + scoutId + '/registrations/' + badId + '/assignments/' + generatedOfferings[0].id)
                    .set('Authorization', generatedUsers.teacher.token)
                    .expect(status.BAD_REQUEST, done);
            });

            test('should not delete for an invalid scout', (done) => {
                request.del('/api/scouts/' + badId + '/registrations/' + registrationIds[0] + '/assignments/' + generatedOfferings[0].id)
                    .set('Authorization', generatedUsers.teacher.token)
                    .expect(status.BAD_REQUEST, done);
            });
        });
    });
});
