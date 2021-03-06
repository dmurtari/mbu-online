import { Request, Response } from 'express';
import status from 'http-status-codes';

import { Badge } from '@models/badge.model';
import { BadgeResponseDto } from '@interfaces/badge.interface';
import { ErrorResponseDto } from '@interfaces/shared.interface';

export const createBadge = async (req: Request, res: Response) => {
    try {
        const badge: Badge = await Badge.create(req.body);
        return res.status(status.CREATED).json(<BadgeResponseDto>{
            message: 'Badge successfully created',
            badge: badge
        });
    } catch (err) {
        return res.status(status.BAD_REQUEST).json(<ErrorResponseDto>{
            message: 'Failed to create badge',
            error: err
        });
    }
};
