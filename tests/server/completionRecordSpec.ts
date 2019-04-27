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
import testScouts from './testScouts';
import { AssignmentRequestInterface, AssignmentResponseInterface } from '@interfaces/assignment.interface';

const request = supertest(app);

describe('completion records', () => {
    let badges: Badge[];
    let events: Event[];
    let generatedUsers: RoleTokenObjects;
    let generatedScouts: Scout[];
    let generatedOfferings: Offering[];
    let scoutId: string;
    let registrationIds: string[];

    const defaultRequirements: string[] = ['1', '2', '3a'];

    beforeEach(async () => {
        await TestUtils.dropDb();
    });

    beforeEach(async () => {
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

    after(async () => {
        await TestUtils.dropDb();
    });

    describe('adding completion records', () => {
        beforeEach((done) => {
            const postData: AssignmentRequestInterface[] = [{
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
                .end((err, res) => {
                    if (err) { return done(err); }
                    const registration = (res.body as any).registration;
                    expect(registration.assignments).to.have.lengthOf(3);
                    registration.assignments.forEach((assignment: any, index: number) => {
                        expect(assignment.details.periods).to.deep.equal(postData[index].periods);
                        expect(assignment.details.completions).to.deep.equal([]);
                        expect(assignment.offering_id).to.equal(postData[index].offering);
                        expect(assignment.price).to.exist;
                        expect(assignment.badge.name).to.exist;
                    });
                    return done();
                });
        });

        it('should allow admins to change completion records', (done) => {
            request.put('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/assignments/' + generatedOfferings[0].id)
                .set('Authorization', generatedUsers.admin.token)
                .send({ completions: ['1', '2'] })
                .expect(status.OK)
                .end((err, res) => {
                    if (err) { return done(err); }
                    const assignment = (res.body as AssignmentResponseInterface).assignment;
                    expect(assignment.offering_id).to.equal(generatedOfferings[0].id);
                    expect(assignment.completions).to.deep.equal(['1', '2']);
                    return done();
                });
        });

        it('should allow teachers to change completion records', (done) => {
            request.put('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/assignments/' + generatedOfferings[0].id)
                .set('Authorization', generatedUsers.admin.token)
                .send({ completions: ['1'] })
                .expect(status.OK, done);
        });

        it('should not allow coordinators to change completion records', (done) => {
            request.put('/api/scouts/' + scoutId + '/registrations/' + registrationIds[0] + '/assignments/' + generatedOfferings[0].id)
                .set('Authorization', generatedUsers.coordinator.token)
                .send({ completions: ['1'] })
                .expect(status.UNAUTHORIZED, done);
        });
    });
});
