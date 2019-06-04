import { Request, NextFunction, Response } from 'express';
import passport from 'passport';
import status from 'http-status-codes';

import { User } from '@models/user.model';
import { MessageResponseDto } from '@app/interfaces/shared.interface';
import { UserRole } from '@interfaces/user.interface';

export const canUpdateRole = (req: Request, res: Response, next: NextFunction) => {
    return passport.authenticate('jwt', { session: false }, (_err, user: User) => {
        if (
            (req.body.role && user.role !== UserRole.ADMIN) ||
            (req.body.approved && user.role !== UserRole.ADMIN) ||
            (req.body.password && (!(user.role === UserRole.ADMIN)) && Number(req.params.userId) !== user.id)
        ) {
            return res.status(status.UNAUTHORIZED).json(<MessageResponseDto>{
                message: 'Only admins are allowed to update roles'
            });
        } else {
            return next();
        }
    })(req, res, next);
};

