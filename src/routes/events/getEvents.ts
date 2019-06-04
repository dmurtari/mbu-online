import { Request, Response } from 'express';
import { WhereOptions } from 'sequelize';
import status from 'http-status-codes';
import { cloneDeep } from 'lodash';

import { CurrentEvent } from '@models/currentEvent.model';
import { Event } from '@models/event.model';
import { ErrorResponseDto } from '@app/interfaces/shared.interface';
import { Badge } from '@models/badge.model';
import { Purchasable } from '@models/purchasable.model';
import { EventInterface, IncomeCalculationResponseDto } from '@interfaces/event.interface';
import { Offering } from '@models/offering.model';
import registrationInformation from '@models/queries/registrationInformation';
import { Registration } from '@models/registration.model';
import { Scout } from '@models/scout.model';
import { CalculationType } from '@routes/shared/calculationType.enum';

export const getEvent = async (req: Request, res: Response) => {
    try {
        const queryableFields = ['id', 'year', 'semester'];
        const query: WhereOptions = queryableFields.reduce((_query: WhereOptions, field: string) => {
            if (req.query[field]) {
                (_query as any)[field] = req.query[field];
            }

            return _query;
        }, {});

        const events: EventInterface[] = await Event.findAll({
            where: query,
            include: [{
                model: Badge,
                as: 'offerings',
                through: <any>{
                    as: 'details'
                }
            }, {
                model: Purchasable,
                as: 'purchasables'
            }]
        });

        return res.status(status.OK).json(events);
    } catch (err) {
        return res.status(status.BAD_REQUEST).json({
            message: 'Error getting events',
            error: err
        });
    }
};

export const getCurrentEvent = async (_req: Request, res: Response) => {
    try {
        const currentEvent: CurrentEvent = await CurrentEvent.findOne({
            include: [{ model: Event }]
        });

        return res.status(status.OK).send(currentEvent.event);
    } catch (err) {
        res.status(status.BAD_REQUEST).json(<ErrorResponseDto>{
            message: 'Failed to get the current event',
            error: err
        });
    }
};

export const getPurchasables = async (req: Request, res: Response) => {
    try {
        const event: Event = await Event.findByPk(req.params.id);
        const purchasables: Purchasable[] = await event.$get('purchasables') as Purchasable[];

        return res.status(status.OK).json(purchasables);
    } catch (err) {
        res.status(status.BAD_REQUEST).json(<ErrorResponseDto>{
            message: 'Failed to get purchasables',
            error: err
        });
    }
};

export const getClassSize = async (req: Request, res: Response) => {
    try {
        const offering: Offering = await Offering.findOne({
            where: {
                badge_id: req.params.badgeId,
                event_id: req.params.eventId
            }
        });

        return res.status(status.OK).send(await offering.getClassSizes());
    } catch (err) {
        res.status(status.BAD_REQUEST).json(<ErrorResponseDto>{
            message: 'Failed to get class size',
            error: err
        });
    }
};

export const getRegistrations = async (req: Request, res: Response) => {
    try {
        const query = cloneDeep(registrationInformation);

        query.where = {
            event_id: req.params.id
        };

        const registrations: Registration[] = await Registration.findAll(query);

        return res.status(status.OK).json(registrations);
    } catch (err) {
        res.status(status.BAD_REQUEST).json(<ErrorResponseDto>{
            message: 'Failed to get registrations',
            error: err
        });
    }
};

export const getAssignees = async (req: Request, res: Response) => {
    try {
        const offerings: Offering[] = await Offering.findAll({
            where: {
                event_id: req.params.id
            },
            attributes: [
                ['id', 'offering_id'],
                'duration',
                'periods',
                'requirements'
            ],
            include: [{
                model: Badge,
                as: 'badge',
                attributes: [
                    'name',
                    ['id', 'badge_id']
                ]
            }, {
                model: Registration,
                as: 'assignees',
                attributes: {
                    exclude: [
                        'projectedCost',
                        'actualCost'
                    ],
                    include: [
                        ['id', 'registration_id'],
                        'notes'
                    ],
                },
                through: {
                    as: 'assignment',
                    attributes: [
                        'periods',
                        'completions'
                    ]
                },
                include: [{
                    model: Scout,
                    as: 'scout',
                    attributes: [
                        'firstname',
                        'lastname',
                        'fullname',
                        'troop'
                    ]
                }]
            }]
        });

        return res.status(status.OK).json(offerings);
    } catch (err) {
        res.status(status.BAD_REQUEST).json(<ErrorResponseDto>{
            message: 'Failed to get assignees',
            error: err
        });
    }
};

export const getPotentialIncome = async (req: Request, res: Response) => {
    income(req, res, CalculationType.Projected);
};

export const getActualIncome = async (req: Request, res: Response) => {
    income(req, res, CalculationType.Actual);
};

export const getStats = async (req: Request, res: Response) => {
    try {
        const statsResult: any = {};

        const [event, registrations]: [Event, Registration[]] = await Promise.all([
            Event.findByPk(req.params.id, {
                include: [{
                    model: Scout,
                    as: 'attendees',
                    attributes: ['id', 'firstname', 'lastname', 'troop']
                }, {
                    model: Badge,
                    as: 'offerings',
                    attributes: ['id', 'name']
                }]
            }),
            Registration.findAll({
                where: {
                    event_id: req.params.id
                },
                attributes: ['scout_id'],
                include: [{
                    model: Purchasable,
                    as: 'purchases',
                    attributes: ['id', 'price', 'has_size'],
                    through: <any>[{
                        as: 'details',
                        attributes: ['quantity', 'size']
                    }]
                }]
            })
        ]);

        statsResult.scouts = event.attendees;
        statsResult.offerings = event.offerings;
        statsResult.registrations = registrations;

        return res.status(status.OK).send(statsResult);
    } catch (err) {
        return res.status(status.BAD_REQUEST).json(<ErrorResponseDto>{
            message: 'Failed to get stats',
            error: err
        });
    }
};

async function income(req: Request, res: Response, type: CalculationType): Promise<Response> {
    try {
        const registrations: Registration[] = await Registration.findAll({
            where: {
                event_id: req.params.id
            }
        });

        if (registrations.length < 1) {
            throw new Error('No registrations found');
        }

        const prices: number[] = await Promise.all(registrations.map(registration => {
            return (type === CalculationType.Actual ? registration.actualCost() : registration.projectedCost());
        }));

        const cost: number = prices.reduce((acc, cur) => acc + cur, 0);

        return res.status(status.OK).json(<IncomeCalculationResponseDto>{
            income: String(cost.toFixed(2))
        });
    } catch (err) {
        return res.status(status.BAD_REQUEST).json(<ErrorResponseDto>{
            message: `Failed to get ${type} event income`,
            error: err
        });
    }
}
