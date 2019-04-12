import supertest from 'supertest';
import * as async from 'async';
import status from 'http-status-codes';
import { expect } from 'chai';
import faker from 'faker';

import app from '@app/app';
import TestUtils from './testUtils';
import { Badge } from '@models/badge.model';
import { UserRole } from '@interfaces/user.interface';
import { BadgeInterface } from '@interfaces/badge.interface';

const request = supertest(app);

describe.only('merit badges', () => {
    let token: string;

    before(async () => {
        await TestUtils.dropDb();
    });

    before(async () => {
        token = (await TestUtils.generateToken(UserRole.ADMIN)).token;
    });

    beforeEach(async () => {
        await TestUtils.dropTable([Badge]);
    });

    after(async () => {
        await TestUtils.dropDb();
    });

    describe('creating merit badges', () => {
        const testBadge: BadgeInterface = {
            name: 'Test',
            description: 'A very good badge',
            notes: 'Eagle'
        };

        it('should create badges with names', (done) => {
            const postData: BadgeInterface = {
                name: 'Test'
            };

            request.post('/api/badges')
                .set('Authorization', token)
                .send(postData)
                .expect(status.CREATED, done);
        });

        it('should require authentication', (done) => {
            const postData = testBadge;

            request.post('/api/badges')
                .send(postData)
                .expect(status.UNAUTHORIZED, done);
        });

        it('should require name', (done) => {
            const postData: BadgeInterface = {
                description: 'No name'
            };

            request.post('/api/badges')
                .set('Authorization', token)
                .send(postData)
                .expect(status.BAD_REQUEST, done);
        });

        it('should not allow blank names', (done) => {
            const postData: BadgeInterface = {
                name: ''
            };

            request.post('/api/badges')
                .set('Authorization', token)
                .send(postData)
                .expect(status.BAD_REQUEST, done);
        });

        it('should allow long details', (done) => {
            const postData: BadgeInterface = {
                name: 'Swimming',
                description: 'Swimming is a leisure activity'
            };

            request.post('/api/badges')
                .set('Authorization', token)
                .send(postData)
                .expect(status.CREATED, done);
        });

        it('should not allow duplicate names', (done) => {
            async.series([
                (cb) => {
                    request.post('/api/badges')
                        .set('Authorization', token)
                        .send(testBadge)
                        .expect(status.CREATED, cb);
                },
                (cb) => {
                    request.post('/api/badges')
                        .set('Authorization', token)
                        .send(testBadge)
                        .expect(status.BAD_REQUEST, cb);
                }
            ], done);
        });

        it('should ignore extra fields', (done) => {
            const postData: any = {
                name: 'Test',
                birthday: 'Nonsense'
            };

            request.post('/api/badges')
                .set('Authorization', token)
                .send(postData)
                .expect(status.CREATED)
                .end((err, res) => {
                    if (err) { return done(err); }
                    expect(res.body.badge.name).to.equal(postData.name);
                    expect(res.body.badge.birthday).not.to.exist;
                    done();
                });
        });
    });

    describe('getting merit badges', () => {
        let id: number;
        const test1: BadgeInterface = {
            name: 'Test',
            description: 'A test',
            notes: 'Notes'
        };
        const test2: BadgeInterface = {
            name: 'Test 2',
            description: 'A second test'
        };

        beforeEach((done) => {
            request.post('/api/badges')
                .set('Authorization', token)
                .send(test1)
                .expect(status.CREATED)
                .end((err, res) => {
                    if (err) { return done(err); }
                    id = res.body.badge.id;
                    done();
                });
        });

        it('should be able to get a badge by id', (done) => {
            request.get('/api/badges?id=' + id)
                .expect(status.OK)
                .end((err, res) => {
                    if (err) { return done(err); }
                    const badge = res.body[0];
                    expect(badge.name).to.equal(test1.name);
                    expect(badge.description).to.equal(test1.description);
                    expect(badge.notes).to.equal(test1.notes);
                    done();
                });
        });

        it('should be able to get a badge by name', (done) => {
            request.get('/api/badges?name=' + test1.name)
                .expect(status.OK)
                .end((err, res) => {
                    if (err) { return done(err); }
                    const badge = res.body[0];
                    expect(badge.name).to.equal(test1.name);
                    expect(badge.description).to.equal(test1.description);
                    expect(badge.notes).to.equal(test1.notes);
                    done();
                });
        });

        it('should respond with all badges if no query is supplied', (done) => {
            async.series([
                (cb) => {
                    request.post('/api/badges')
                        .set('Authorization', token)
                        .send(test2)
                        .expect(status.CREATED)
                        .end((err) => {
                            if (err) { return done(err); }
                            cb();
                        });
                },
                (cb) => {
                    request.get('/api/badges')
                        .expect(status.OK)
                        .end((err, res) => {
                            if (err) { return done(err); }
                            const badges = res.body;
                            expect(badges.length).to.equal(2);
                            cb();
                        });
                }
            ], done);
        });

        it('should fail gracefully if incorrect arguments are supplied', (done) => {
            request.get('/api/badges?wrong=hello')
                .expect(status.OK, done);
        });

        it('should not fail if a badge does not exist', (done) => {
            request.get('/api/badges?name=dne')
                .expect(status.OK, done);
        });
    });

    describe('removing a merit badge', () => {
        let id: number;

        it('should remove a badge with a given id', (done) => {
            const badge: BadgeInterface = {
                name: 'Test'
            };

            async.series([
                (cb) => {
                    request.post('/api/badges')
                        .set('Authorization', token)
                        .send(badge)
                        .expect(status.CREATED)
                        .end((err, res) => {
                            if (err) { return done(err); }
                            id = res.body.badge.id;
                            cb();
                        });
                },
                (cb) => {
                    request.del('/api/badges/' + id)
                        .set('Authorization', token)
                        .expect(status.OK, cb);
                },
                (cb) => {
                    request.get('/api/badges?id=' + id)
                        .expect(status.OK)
                        .end((err, res) => {
                            if (err) { return done(err); }
                            const badges = res.body;
                            expect(badges.length).to.equal(0);
                            cb();
                        });
                }
            ], done);
        });

        it('should fail gracefully if a badge is not found with a valid id form', (done) => {
            request.del('/api/badges/123123')
                .set('Authorization', token)
                .expect(status.BAD_REQUEST, done);
        });

        it('should fail gracefully if a valid id is not supplied', (done) => {
            request.del('/api/badges/invalidid')
                .set('Authorization', token)
                .expect(status.BAD_REQUEST, done);
        });

        it('should fail gracefully if delete is sent to the wrong endpoint', (done) => {
            request.del('/api/badges')
                .set('Authorization', token)
                .expect(status.NOT_FOUND, done);
        });
    });

    describe('editing a merit badge', () => {
        let id: number;
        const badge: BadgeInterface = {
            name: 'Test',
            description: 'What',
            notes: 'Note'
        };

        it('should update a badge with all fields', (done) => {
            const badgeUpdate: BadgeInterface = {
                name: 'Test updated',
                description: 'New',
                notes: 'Updated'
            };

            async.series([
                (cb) => {
                    request.post('/api/badges')
                        .set('Authorization', token)
                        .send(badge)
                        .expect(status.CREATED)
                        .end((err, res) => {
                            if (err) { return done(err); }
                            id = res.body.badge.id;
                            cb();
                        });
                },
                (cb) => {
                    request.put('/api/badges/' + id)
                        .set('Authorization', token)
                        .send(badgeUpdate)
                        .expect(status.OK)
                        .end((err, res) => {
                            if (err) { return done(err); }
                            expect(res.body.badge.name).to.equal(badgeUpdate.name);
                            expect(res.body.badge.description).to.equal(badgeUpdate.description);
                            expect(res.body.badge.notes).to.equal(badgeUpdate.notes);
                            expect(res.body.badge.id).to.equal(id);
                            cb();
                        });
                }
            ], done);
        });

        it('should update a badge with partial fields', (done) => {
            const badgeUpdate: BadgeInterface = {
                name: 'Test updated'
            };

            async.series([
                (cb) => {
                    request.post('/api/badges')
                        .set('Authorization', token)
                        .send(badge)
                        .expect(status.CREATED)
                        .end((err, res) => {
                            if (err) { return done(err); }
                            id = res.body.badge.id;
                            cb();
                        });
                },
                (cb) => {
                    request.put('/api/badges/' + id)
                        .set('Authorization', token)
                        .send(badgeUpdate)
                        .expect(status.OK)
                        .end((err, res) => {
                            if (err) { return done(err); }
                            expect(res.body.badge.name).to.equal(badgeUpdate.name);
                            expect(res.body.badge.id).to.equal(id);
                            expect(res.body.badge.description).to.exist;
                            expect(res.body.badge.notes).to.exist;
                            cb();
                        });
                }
            ], done);
        });

        it('should fail gracefully if required fields are not supplied', (done) => {
            const badgeUpdate: BadgeInterface = {
                name: null,
                description: 'New',
                notes: 'Updated'
            };

            async.series([
                (cb) => {
                    request.post('/api/badges')
                        .set('Authorization', token)
                        .send(badge)
                        .expect(status.CREATED)
                        .end((err, res) => {
                            if (err) { return done(err); }
                            id = res.body.badge.id;
                            cb();
                        });
                },
                (cb) => {
                    request.put('/api/badges/' + id)
                        .set('Authorization', token)
                        .send(badgeUpdate)
                        .expect(status.BAD_REQUEST, cb);
                }
            ], done);
        });

        it('should not allow badges to be modified to be duplicates', (done) => {
            let id2: number;
            const badge2 = Object.assign({}, badge);
            badge2.name = 'Different';

            async.series([
                (cb) => {
                    request.post('/api/badges')
                        .set('Authorization', token)
                        .send(badge)
                        .expect(status.CREATED)
                        .end((err, res) => {
                            if (err) { return done(err); }
                            id = res.body.badge.id;
                            cb();
                        });
                },
                (cb) => {
                    request.post('/api/badges')
                        .set('Authorization', token)
                        .send(badge2)
                        .expect(status.CREATED)
                        .end((err, res) => {
                            if (err) { return done(err); }
                            id2 = res.body.badge.id;
                            cb();
                        });
                },
                (cb) => {
                    request.put('/api/badges/' + id2)
                        .set('Authorization', token)
                        .send(badge)
                        .expect(status.BAD_REQUEST, cb);
                }
            ], done);
        });

        it('should not edit the badge if no fields are supplied', (done) => {
            async.series([
                (cb) => {
                    request.post('/api/badges')
                        .set('Authorization', token)
                        .send(badge)
                        .expect(status.CREATED)
                        .end((err, res) => {
                            if (err) { return done(err); }
                            id = res.body.badge.id;
                            cb();
                        });
                },
                (cb) => {
                    request.put('/api/badges/' + id)
                        .set('Authorization', token)
                        .send({})
                        .expect(status.OK, (err, res) => {
                            if (err) { return done(err); }
                            expect(res.body.badge.id).to.equal(id);
                            expect(res.body.badge.name).to.equal(badge.name);
                            expect(res.body.badge.description).to.equal(badge.description);
                            expect(res.body.badge.notes).to.equal(badge.notes);
                            cb();
                        });
                }
            ], done);
        });

        it('should fail gracefully if the badge is not found', (done) => {
            async.series([
                (cb) => {
                    request.post('/api/badges')
                        .set('Authorization', token)
                        .send(badge)
                        .expect(status.CREATED)
                        .end((err, res) => {
                            if (err) { return done(err); }
                            id = res.body.badge.id;
                            cb();
                        });
                },
                (cb) => {
                    request.put('/api/badges/123456789012345678901234')
                        .set('Authorization', token)
                        .send({
                            name: 'DNE'
                        })
                        .expect(status.BAD_REQUEST, cb);
                }
            ], done);
        });

        it('should not edit the badge if an empty request is sent', (done) => {
            async.series([
                (cb) => {
                    request.post('/api/badges')
                        .set('Authorization', token)
                        .send(badge)
                        .expect(status.CREATED)
                        .end((err, res) => {
                            if (err) { return done(err); }
                            id = res.body.badge.id;
                            cb();
                        });
                },
                (cb) => {
                    request.put('/api/badges/' + id)
                        .set('Authorization', token)
                        .expect(status.OK, (err, res) => {
                            if (err) { return done(err); }
                            expect(res.body.badge.id).to.equal(id);
                            expect(res.body.badge.name).to.equal(badge.name);
                            expect(res.body.badge.description).to.equal(badge.description);
                            expect(res.body.badge.notes).to.equal(badge.notes);
                            cb();
                        });
                }
            ], done);
        });

        it('should fail gracefully if no id is sent', (done) => {
            request.put('/api/badges/')
                .set('Authorization', token)
                .expect(status.NOT_FOUND, done);
        });

        it('should allow long details', (done) => {
            async.series([
                (cb) => {
                    request.post('/api/badges')
                        .set('Authorization', token)
                        .send(badge)
                        .expect(status.CREATED)
                        .end((err, res) => {
                            if (err) { return done(err); }
                            id = res.body.badge.id;
                            cb();
                        });
                },
                (cb) => {
                    request.put('/api/badges/' + id)
                        .set('Authorization', token)
                        .send({
                            description: faker.lorem.paragraph(3)
                        })
                        .expect(status.OK, cb);
                }
            ], done);
        });
    });
});
