import { Response } from 'supertest';

export interface SuperTestResponse<T> extends Response {
    body: T;
}
