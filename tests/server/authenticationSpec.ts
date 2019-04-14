import supertest from 'supertest';
import status from 'http-status-codes';
import { expect } from 'chai';

import app from '@app/app';
import TestUtils from './testUtils';
import { SignupRequestInterface } from '@interfaces/user.interface';

const request = supertest(app);

describe('authentication', () => {
    beforeEach(async () => {
        await TestUtils.dropDb();
    });

    after(async () => {
        await TestUtils.dropDb();
    });

    describe('user roles', () => {
        it('should create a user with a default role', (done) => {
            const postData: SignupRequestInterface = {
                email: 'test@test.com',
                password: 'password',
                firstname: 'firstname',
                lastname: 'lastname'
            };

            request.post('/api/signup')
                .send(postData)
                .expect(status.CREATED)
                .end((err, res) => {
                    if (err) { return done(err); }
                    const user = res.body.profile;
                    expect(user.email).to.equal(postData.email);
                    expect(user.role).to.equal('anonymous');
                    return done();
                });
        });

        it('should create a user with a role', (done) => {
            const postData: SignupRequestInterface = {
                email: 'test@test.com',
                password: 'password',
                firstname: 'firstname',
                lastname: 'lastname',
                role: 'coordinator'
            };

            request.post('/api/signup')
                .send(postData)
                .expect(status.CREATED)
                .end((err, res) => {
                    if (err) { return done(err); }
                    const user = res.body.profile;
                    expect(user.email).to.equal(postData.email);
                    expect(user.role).to.equal(postData.role);
                    return done();
                });
        });

        it('should not create a user with an invalid role', (done) => {
            const postData: SignupRequestInterface = {
                email: 'test@test.com',
                password: 'password',
                firstname: 'firstname',
                lastname: 'lastname',
                role: 'superuser'
            };

            request.post('/api/signup')
                .send(postData)
                .expect(status.BAD_REQUEST, done);
        });
    });
});
