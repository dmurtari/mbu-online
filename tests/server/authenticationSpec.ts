import supertest from 'supertest';
import status from 'http-status-codes';
import { expect } from 'chai';

import app from '@app/app';
import TestUtils from './testUtils';
import { SignupRequestDto, UserTokenResponseDto } from '@interfaces/user.interface';
import { SuperTestResponse } from '@test/helpers/supertest.interface';

const request = supertest(app);

describe('authentication', () => {
    beforeEach(async () => {
        await TestUtils.dropDb();
    });

    afterAll(async () => {
        await TestUtils.dropDb();
        await TestUtils.closeDb();
    });

    describe('user roles', () => {
        test('should create a user with a default role', (done) => {
            const postData: SignupRequestDto = {
                email: 'test@test.com',
                password: 'password',
                firstname: 'firstname',
                lastname: 'lastname'
            };

            request.post('/api/signup')
                .send(postData)
                .expect(status.CREATED)
                .end((err, res: SuperTestResponse<UserTokenResponseDto>) => {
                    if (err) { return done(err); }
                    const user = res.body.profile;
                    expect(user.email).to.equal(postData.email);
                    expect(user.role).to.equal('anonymous');
                    return done();
                });
        });

        test('should create a user with a role', (done) => {
            const postData: SignupRequestDto = {
                email: 'test@test.com',
                password: 'password',
                firstname: 'firstname',
                lastname: 'lastname',
                role: 'coordinator'
            };

            request.post('/api/signup')
                .send(postData)
                .expect(status.CREATED)
                .end((err, res: SuperTestResponse<UserTokenResponseDto>) => {
                    if (err) { return done(err); }
                    const user = res.body.profile;
                    expect(user.email).to.equal(postData.email);
                    expect(user.role).to.equal(postData.role);
                    return done();
                });
        });

        test('should not create a user with an invalid role', (done) => {
            const postData: SignupRequestDto = {
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
