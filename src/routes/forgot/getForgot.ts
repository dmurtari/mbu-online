import { Request, Response } from 'express';
import status from 'http-status-codes';
import { Op } from 'sequelize';

import { ErrorResponseDto, MessageResponseDto } from '@interfaces/shared.interface';
import { User } from '@models/user.model';

export const tokenValid = async (req: Request, res: Response) => {
    try {
        const users: User[] = await User.findAll({
            where: {
                reset_password_token: req.params.token,
                reset_token_expires: {
                    [Op.gt]: Date.now()
                }
            }
        });

        if (users.length < 1) {
            throw new Error('No user found');
        }

        return res.status(status.BAD_REQUEST).json(<MessageResponseDto>{
            message: 'Reset token valid'
        });
    } catch (err) {
        return res.status(status.BAD_REQUEST).json(<ErrorResponseDto>{
            error: err,
            message: 'Reset token invalid or expired'
        });
    }
};
