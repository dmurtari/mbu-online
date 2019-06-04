import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import status from 'http-status-codes';

import { User } from '@models/user.model';
import { MessageResponseDto } from '@app/interfaces/shared.interface';
import { UserRole } from '@interfaces/user.interface';

export const isAuthorized = (roles: UserRole[] = []) => (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('jwt', { session: false }, (err, user: User) => {
        if (!!err) {
            return next(err);
        }

        if (!user) {
            return res.status(status.UNAUTHORIZED).json(<MessageResponseDto>{
                message: 'Could not find a user with the given token'
            });
        }

        if (!user.approved) {
            return res.status(status.UNAUTHORIZED).json(<MessageResponseDto>{
                message: 'Account has not been approved yet'
            });
        }

        const authorizedRoles: UserRole[] = [UserRole.ADMIN, ...roles];

        if (authorizedRoles.includes(user.role)) {
            return next();
        } else {
            return res.status(status.UNAUTHORIZED).json(<MessageResponseDto>{
                message: 'Current role is not authorized to access this endpoint'
            });
        }
    })(req, res, next);
};

