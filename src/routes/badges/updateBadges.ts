import { Request, Response } from 'express';
import status from 'http-status-codes';

import { Badge } from '@models/badge.model';
import { BadgeResponseDto } from '@app/interfaces/badge.interface';
import { ErrorResponseDto } from '@app/interfaces/shared.interface';

export const updateBadge = async (req: Request, res: Response) => {
    try {
        const badge: Badge = await Badge.findByPk(req.params.id);

        if (!badge) {
            throw new Error('Badge to update not found');
        }

        await badge.update(req.body);

        return res.status(status.OK).json(<BadgeResponseDto>{
            message: 'Badge updated successfully',
            badge: badge
        });
    } catch (err) {
        return res.status(status.BAD_REQUEST).json(<ErrorResponseDto>{
            message: 'Error updating badge',
            error: err
        });
    }
};
