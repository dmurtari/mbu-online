import { Request, Response } from 'express';
import status from 'http-status-codes';

export const getIndex = (_req: Request, res: Response) => {
    res.status(status.OK).send('Welcome to the MBU API');
};
