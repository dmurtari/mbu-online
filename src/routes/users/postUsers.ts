import { Request, Response } from 'express';
import { Op } from 'sequelize';
import jwt from 'jsonwebtoken';
import status from 'http-status-codes';

import config from '@config/secrets';
import { User } from '@models/user.model';
import { UserTokenResponseDto, UserRole } from '@interfaces/user.interface';
import { ErrorResponseDto } from '@interfaces/shared.interface';
import { Scout } from '@models/scout.model';
import { Event } from '@models/event.model';

export const signup = async (req: Request, res: Response) => {
    if (!req.body.email || !req.body.password || !req.body.firstname || !req.body.lastname) {
        return res.status(status.BAD_REQUEST).json({
            message: 'Email, password, firstname, lastname required'
        });
    }

    const newUser: User = req.body;
    newUser.approved = false;

    try {
        const user: User = await User.create(newUser);
        await user.save();
        const token = jwt.sign(user.id, config.APP_SECRET);
        user.set('password', null);

        return res.status(status.CREATED).json(<UserTokenResponseDto>{
            token: `JWT ${token}`,
            profile: user
        });
    } catch (err) {
        return res.status(status.BAD_REQUEST).json(<ErrorResponseDto>{
            message: 'Failed to create user',
            error: err
        });
    }
};

export const authenticate = async (req: Request, res: Response) => {
    try {
        const user: User = await User.findOne({
            where: {
                email: {
                    [Op.iLike]: req.body.email
                }
            }
        });

        if (!user) {
            throw new Error('No matching email found');
        }

        if (await user.comparePassword(req.body.password)) {
            const token: string = jwt.sign(user.id, config.APP_SECRET);
            user.set('password', null);

            return res.status(status.OK).json(<UserTokenResponseDto>{
                token: `JWT ${token}`,
                profile: user
            });
        } else {
            throw new Error('Password do no match');
        }
    } catch (err) {
        return res.status(status.UNAUTHORIZED).json(<ErrorResponseDto>{
            message: 'User authentication failed',
            error: err
        });
    }
};

export const addScout = async (req: Request, res: Response) => {
    try {
        const scout: Scout = await Scout.create(req.body);
        const user: User = await User.findByPk(req.params.userId);

        if (!user) {
            throw new Error('User not found');
        }

        if (user.role !== UserRole.COORDINATOR) {
            throw new Error('Can only add scouts to coordinators');
        }

        await user.$add('scout', scout);

        return res.status(status.CREATED).json({
            message: 'Scout successfully created',
            scout: await Scout.findByPk(scout.id, {
                include: [{
                    model: Event,
                    as: 'registrations'
                }]
            })
        });
    } catch (err) {
        return res.status(status.BAD_REQUEST).json(<ErrorResponseDto>{
            message: 'Error creating scout',
            error: err
        });
    }
};
