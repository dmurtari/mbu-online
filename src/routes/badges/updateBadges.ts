import { Request, Response } from 'express';
import status from 'http-status-codes';

import { Badge } from '@models/badge.model';
import { BadgeResponseInterface } from '@app/interfaces/badge.interface';
import { ErrorResponseInterface } from '@app/interfaces/shared.interface';

export const updateBadge = async (req: Request, res: Response) => {
    try {
        const badge: Badge = await Badge.findByPk(req.params.id);

        if (!badge) {
            throw new Error('Badge to update not found');
        }

        await badge.update(req.body);

        return res.status(status.OK).json(<BadgeResponseInterface>{
            message: 'Badge updated successfully',
            badge: badge
        });
    } catch (err) {
        return res.status(status.BAD_REQUEST).json(<ErrorResponseInterface>{
            message: 'Error updating badge',
            error: err
        });
    }
};
