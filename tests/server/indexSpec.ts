import supertest from 'supertest';
import status from 'http-status-codes';

import app from '@app/app';

const request = supertest(app);

describe('index', () => {
    test('responds with OK if found', (done) => {
        request.get('/api')
            .expect(status.OK, done);
    });

    test('responds with 404 if invalid', (done) => {
        request.get('/')
            .expect(status.NOT_FOUND, done);
    });
});
