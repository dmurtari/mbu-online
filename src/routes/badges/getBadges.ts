import { Request, Response } from 'express';
import status from 'http-status-codes';
import { WhereOptions } from 'sequelize';

import { Badge } from '@models/badge.model';
import { ErrorResponseInterface } from '@app/interfaces/shared.interface';

export const getBadges = async (req: Request, res: Response) => {
    try {
        const queryableFields: string[] = ['name', 'semester'];
        const query: WhereOptions = {};

        queryableFields.forEach(field => {
            if (req.query[field]) {
                query[field] = req.query[field];
            }
        });

        const badges: Badge[] = await Badge.findAll({ where: query });

        return res.status(status.OK).json(badges);
    } catch (err) {
        return res.status(status.BAD_REQUEST).send(<ErrorResponseInterface>{
            message: 'Failed to get badges',
            error: err
        });
    }
};
