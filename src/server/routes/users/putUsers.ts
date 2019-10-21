import { Request, Response } from 'express';
import status from 'http-status-codes';
import jwt from 'jsonwebtoken';

import { User } from '@models/user.model';
import config from '@config/secrets';

import { EditUserResponseDto } from '@interfaces/user.interface';
import { ErrorResponseDto } from '@interfaces/shared.interface';
import { Scout } from '@models/scout.model';
import { ScoutResponseDto } from '@interfaces/scout.interface';

export const updateProfile = async (req: Request, res: Response) => {
    try {
        const user: User = await User.findByPk(req.params.userId);

        if (!user) {
            throw new Error('Profile to update not found');
        }

        await user.update(req.body);

        user.set('password', null);

        const response: EditUserResponseDto = {
            message: 'User profile updated',
            profile: user
        };

        if (req.body.password) {
            const token: string = jwt.sign(user.id, config.APP_SECRET);
            response.token = `JWT ${token}`;
        }

        return res.status(status.OK).json(response);
    } catch (err) {
        return res.status(status.BAD_REQUEST).json(<ErrorResponseDto>{
            message: 'Error updating user',
            error: err
        });
    }
};

export const updateScout = async (req: Request, res: Response) => {
    try {
        const scout: Scout = await Scout.findByPk(req.params.scoutId);
        await scout.update(req.body);

        return res.status(status.OK).json(<ScoutResponseDto>{
            message: 'Scout successfully updated',
            scout: scout
        });
    } catch (err) {
        return res.status(status.BAD_REQUEST).json(<ErrorResponseDto>{
            message: 'Error updating scout',
            error: err
        });
    }
};
