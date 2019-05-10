import { Request, Response } from 'express';
import status from 'http-status-codes';

import { Badge } from '@models/badge.model';
import { BadgeResponseDto } from '@app/interfaces/badge.interface';
import { ErrorResponseInterface } from '@app/interfaces/shared.interface';

export const createBadge = async (req: Request, res: Response) => {
    try {
        const badge: Badge = await Badge.create(req.body);
        return res.status(status.CREATED).json(<BadgeResponseDto>{
            message: 'Badge successfully created',
            badge: badge
        });
    } catch (err) {
        return res.status(status.BAD_REQUEST).json(<ErrorResponseInterface>{
            message: 'Failed to create badge',
            error: err
        });
    }
};
