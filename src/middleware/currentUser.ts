import { Request, NextFunction, Response } from 'express';
import passport from 'passport';
import status from 'http-status-codes';

import { User } from '@models/user.model';
import { MessageResponseDto } from '@app/interfaces/shared.interface';
import { UserRole } from '@interfaces/user.interface';

export const currentUser = (otherAuthorizedRoles: UserRole[] = []) => (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('jwt', { session: false }, (_err, user: User) => {
        const roles = [UserRole.ADMIN, ...otherAuthorizedRoles];

        if (roles.includes(user.role)) {
            return next();
        }

        if ((req.params.userId && Number(req.params.userId) !== user.id) || (req.query.id && Number(req.query.id) !== user.id)) {
            return res.status(status.UNAUTHORIZED).json(<MessageResponseDto>{
                message: 'Not the current user'
            });
        } else {
            return next();
        }
    })(req, res, next);
};
