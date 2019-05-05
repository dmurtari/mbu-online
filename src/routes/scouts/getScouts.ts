import { Model, FindAttributeOptions, FindOptions } from 'sequelize';
import { Request, Response } from 'express';
import status from 'http-status-codes';
import { cloneDeep } from 'lodash';

import { ErrorResponseInterface } from '@interfaces/shared.interface';
import registrationInformation from '@models/queries/registrationInformation';
import { Registration } from '@models/registration.model';
import { Offering } from '@models/offering.model';
import { Purchasable } from '@models/purchasable.model';
import { Scout } from '@models/scout.model';
import { Event } from '@models/event.model';
import { User } from '@models/user.model';
import { CostCalculationResponseInterface } from '@interfaces/registration.interface';

const scoutQuery: FindOptions = {
    attributes: [
        ['id', 'scout_id'],
        'firstname',
        'lastname',
        'fullname',
        'troop',
        'notes',
        'emergency_name',
        'emergency_relation',
        'emergency_phone'
    ],
    include: [{
        model: Event,
        as: 'registrations',
        attributes: [
            ['id', 'event_id'],
            'year',
            'semester'
        ],
        through: <any>{
            as: 'details'
        }
    }, {
        model: User,
        as: 'user',
        attributes: [
            ['id', 'user_id'],
            'firstname',
            'lastname',
            'fullname',
            'email'
        ]
    }]
};

interface QueryDetailInterface {
    model: typeof Model;
    modelAttributes?: FindAttributeOptions;
    joinAttributes: FindAttributeOptions;
}

export const getRegistrations = async (req: Request, res: Response) => {
    try {
        const query = cloneDeep(registrationInformation);
        query.where = {
            scout_id: req.params.scoutId
        };

        const registrations: Registration[] = await Registration.findAll(query);

        return res.status(status.OK).json(registrations);
    } catch (err) {
        res.status(status.BAD_REQUEST).send(<ErrorResponseInterface>{
            message: 'Could not get registration',
            error: err
        });
    }
};

export const getPreferences = async (req: Request, res: Response) => {
    getRegistrationDetails(req, res, 'preferences');
};

export const getAssignments = async (req: Request, res: Response) => {
    getRegistrationDetails(req, res, 'assignments');
};

export const getPurchases = async (req: Request, res: Response) => {
    getRegistrationDetails(req, res, 'purchases');
};

export const getProjectedCost = async (req: Request, res: Response) => {
    getCost(req, res, 'projectedCost');
};

export const getActualCost = async (req: Request, res: Response) => {
    getCost(req, res, 'actualCost');
};

export const getAll = async (_req: Request, res: Response) => {
    try {
        const scouts: Scout[] = await Scout.findAll(scoutQuery);

        return res.status(status.OK).json(scouts);
    } catch (err) {
        return res.status(status.BAD_REQUEST).send(<ErrorResponseInterface>{
            message: `Failed to get all scouts`,
            error: err
        });
    }
};

export const getScout = async (req: Request, res: Response) => {
    try {
        const scout: Scout = await Scout.findByPk(req.params.scoutId, scoutQuery);

        return res.status(status.OK).json(scout);
    } catch (err) {
        return res.status(status.BAD_REQUEST).send(<ErrorResponseInterface>{
            message: `Failed to get scout`,
            error: err
        });
    }
};

async function getRegistrationDetails(req: Request, res: Response, target: 'preferences'|'assignments'|'purchases'): Promise<Response> {
    const detailQueryMap: { [key: string]: QueryDetailInterface } = {
        preferences: {
            model: Offering,
            modelAttributes: ['badge_id', ['id', 'offering_id']],
            joinAttributes: ['rank']
        },
        assignments: {
            model: Offering,
            modelAttributes: ['badge_id', ['id', 'offering_id']],
            joinAttributes: ['periods', 'completions']
        },
        purchases: {
            model: Purchasable,
            joinAttributes: ['quantity', 'size']
        }
    };

    try {
        const registration: Registration = await Registration.findOne({
            where: {
                id: req.params.registrationId,
                scout_id: req.params.scoutId
            },
            include: [{
                model: detailQueryMap[target].model,
                as: target,
                attributes: detailQueryMap[target].modelAttributes,
                through: {
                    as: 'details',
                    attributes: detailQueryMap[target].joinAttributes
                }
            }]
        });

        return res.status(status.OK).send(registration[target]);
    } catch (err) {
        return res.status(status.BAD_REQUEST).send(<ErrorResponseInterface>{
            message: `Failed to get ${target}`,
            error: err
        });
    }
}

async function getCost(req: Request, res: Response, type: 'projectedCost'|'actualCost'): Promise<Response> {
    try {
        const registration: Registration = await Registration.findOne({
            where: {
                id: req.params.registrationId,
                scout_id: req.params.scoutId
            }
        });

        const cost: number = await (type === 'actualCost' ? registration.actualCost() : registration.projectedCost());

        return res.status(status.OK).json(<CostCalculationResponseInterface>{
            cost: String(cost.toFixed(2))
        });
    } catch (err) {
        res.status(status.BAD_REQUEST).send(<ErrorResponseInterface>{
            message: 'Failed to calculate costs',
            error: err
        });
    }
}
