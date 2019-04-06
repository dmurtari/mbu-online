import supertest from 'supertest';
import status from 'http-status-codes';

import app from '@app/app';

const request = supertest(app);

describe('index', () => {
    it('responds with OK if found', (done) => {
        request.get('/api')
            .expect(status.OK, done);
    });

    it('responds with 404 if invalid', (done) => {
        request.get('/')
            .expect(status.NOT_FOUND, done);
    });
});
