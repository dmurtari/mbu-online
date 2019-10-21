import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import status from 'http-status-codes';

import { User } from '@models/user.model';
import { UserRole } from '@interfaces/user.interface';
import { Scout } from '@models/scout.model';
import { MessageResponseDto } from '@interfaces/shared.interface';

export const isOwner = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('jwt', { session: false }, async (_err, user: User) => {
        if (user.role === UserRole.ADMIN || user.role === UserRole.TEACHER) {
            return next();
        }

        try {
            const scout = await Scout.findByPk(req.params.scoutId);

            if (!scout) {
                return res.status(status.BAD_REQUEST).json(<MessageResponseDto>{
                    message: 'Scout not found'
                });
            }

            if (scout.user_id === user.id && user.role === UserRole.COORDINATOR) {
                return next();
            } else {
                return res.status(status.UNAUTHORIZED).json(<MessageResponseDto>{
                    message: 'Current user is not authorized to update this scout'
                });
            }
        } catch (err) {
            return next(err);
        }
    })(req, res, next);
};
