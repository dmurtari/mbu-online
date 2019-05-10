
import { Request, Response } from 'express';
import status from 'http-status-codes';
import { Op, WhereOptions, Includeable } from 'sequelize';

import { User } from '@models/user.model';
import { ErrorResponseInterface } from '@interfaces/shared.interface';
import { UserExistsResponseDto, UserProfileResponseDto } from '@interfaces/user.interface';
import { Scout } from '@models/scout.model';
import registrationInformation from '@models/queries/registrationInformation';
import { cloneDeep } from 'lodash';
import { Registration } from '@models/registration.model';
import { Event } from '@models/event.model';
import { CostCalculationResponseInterface } from '@interfaces/registration.interface';
import { CalculationType } from '@routes/shared/calculationType.enum';

export const byEmail = async (req: Request, res: Response) => {
    try {
        const users: User[] = await User.findAll({
            where: {
                email: {
                    [ Op.iLike ]: req.params.email
                }
            }
        });

        res.status(status.OK).json(<UserExistsResponseDto>{ exists: users.length > 0 });
    } catch (err) {
        res.status(status.BAD_REQUEST).json(<ErrorResponseInterface>{
            message: 'Failed to find users',
            error: err
        });
    }
};

export const fromToken = async (req: Request, res: Response) => {
    return res.status(status.OK).json(<UserProfileResponseDto>{
        message: 'Successfully authenticated',
        profile: req.user
    });
};

export const byId = (includeScouts: boolean = false) => async (req: Request, res: Response) => {
    let query: WhereOptions;
    const include: Includeable[] = [];

    if (req.params.userId) {
        query = { id: req.params.userId };
    } else if (req.params.id) {
        query = { id: req.params.id };
    } else if (!req.query) {
        query = {};
    } else {
        return res.status(status.BAD_REQUEST).json(<ErrorResponseInterface>{
            message: 'Invalid query'
        });
    }

    if (includeScouts) {
        include.push({
            model: Scout,
            as: 'scouts'
        });
    }

    try {
        const users: User[] = await User.findAll({
            where: query,
            attributes: {
                exclude: [ 'password' ]
            },
            include: include
        });

        if (users.length < 1)  {
            throw new Error('User not found');
        }

        return res.status(status.OK).json(users);
    } catch (err) {
        return res.status(status.BAD_REQUEST).json(<ErrorResponseInterface>{
            error: err,
            message: 'Error getting user'
        });
    }
};

export const getEventRegistrations = async (req: Request, res: Response) => {
    try {
        const query = cloneDeep(registrationInformation);

        query.where = {
            event_id: req.params.eventId
        };

        (<any>query.include[0]).where = {
            user_id: req.params.userId
        };

        const registrations: Registration[] = await Registration.findAll(query);

        return res.status(status.OK).json(registrations);

    } catch (err) {
        return res.status(status.BAD_REQUEST).json(<ErrorResponseInterface>{
            error: err,
            message: 'Could not get registrations for event'
        });
    }
};

export const getScoutRegistrations = async (req: Request, res: Response) => {
    try {
        const scouts: Scout[] = await Scout.findAll({
            where: {
                user_id: req.params.userId
            },
            include: [{
                model: Event,
                as: 'registrations',
                through: <any>{
                    as: 'details'
                },
                attributes: [['id', 'event_id']]
            }]
        });

        res.status(status.OK).json(scouts);
    } catch (err) {
        return res.status(status.BAD_REQUEST).json(<ErrorResponseInterface>{
            error: err,
            message: 'Could not get registration for scout'
        });
    }
};

export const getProjectedCost = async (req: Request, res: Response) => {
    getCost(req, res, CalculationType.Projected);
};

export const getActualCost = async (req: Request, res: Response) => {
    getCost(req, res, CalculationType.Actual);
};

async function getCost(req: Request, res: Response, type: CalculationType): Promise<Response> {
    try {
        const registrations: Registration[] = await Registration.findAll({
            where: {
                event_id: req.params.eventId
            },
            include: [{
                model: Scout,
                where: {
                    user_id: req.params.userId
                }
            }]
        });

        if (registrations.length < 1) {
            throw new Error('No registrations found');
        }

        const prices: number[] = await Promise.all(registrations.map(registration => {
            return (type === CalculationType.Actual ? registration.actualCost() : registration.projectedCost());
        }));

        const cost: number = prices.reduce((acc, cur) => acc + cur, 0);

        return res.status(status.OK).json(<CostCalculationResponseInterface>{
            cost: String(cost.toFixed(2))
        });
    } catch (err) {
        return res.status(status.BAD_REQUEST).json(<ErrorResponseInterface>{
            error: err,
            message: `Could not calculate ${type} pricing information`
        });
    }
}
