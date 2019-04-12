import { Request, Response } from 'express';
import status from 'http-status-codes';

import { Badge } from '@models/badge.model';
import { ErrorResponseInterface } from '@app/interfaces/shared.interface';

export const deleteBadge = async (req: Request, res: Response) => {
    try {
        const badge: Badge = await Badge.findByPk(req.params.id);
        await badge.destroy();

        return res.status(status.OK).end();
    } catch (err) {
        return res.status(status.BAD_REQUEST).json(<ErrorResponseInterface>{
            message: 'Failed to delete badge',
            error: err
        });
    }
};
