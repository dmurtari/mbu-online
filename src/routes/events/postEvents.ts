import { Request, Response } from 'express';
import status from 'http-status-codes';

import { Event } from '@models/event.model';
import { EventResponseDto, CurrentEventResponseDto, EventOfferingInterface, CreateOfferingResponseDto } from '@interfaces/event.interface';
import { ErrorResponseInterface } from '@app/interfaces/shared.interface';
import { CurrentEvent } from '@models/currentEvent.model';
import { Offering } from '@models/offering.model';
import { Badge } from '@models/badge.model';
import { Purchasable } from '@models/purchasable.model';
import { PurchasablesResponseInterface } from '@interfaces/purchasable.interface';

export const createEvent = async (req: Request, res: Response) => {
    try {
        const event: Event = await Event.create(req.body);
        return res.status(status.CREATED).json(<EventResponseDto>{
            message: 'Event successfully created',
            event: event
        });
    } catch (err) {
        return res.status(status.BAD_REQUEST).json(<ErrorResponseInterface>{
            message: 'Event creation failed',
            error: err
        });
    }
};

export const setCurrentEvent = async (req: Request, res: Response) => {
    try {
        const [event, currentEvent] = await Promise.all([
            Event.findByPk(req.body.id),
            new Promise<CurrentEvent>(async (resolve) => {
                const dbCurrentEvent = await CurrentEvent.findOne();
                if (!!dbCurrentEvent) {
                    resolve(dbCurrentEvent);
                } else {
                    resolve(await CurrentEvent.create({}));
                }
            })
        ]);

        if (!event) {
            throw new Error('Event to set as current not found');
        }

        await currentEvent.$set('event', event);

        return res.status(status.OK).json(<CurrentEventResponseDto>{
            message: 'Current event set',
            currentEvent: await Event.findByPk(currentEvent.event_id)
        });
    } catch (err) {
        res.status(status.BAD_REQUEST).json(<ErrorResponseInterface>{
            message: 'Setting current event failed',
            error: err
        });
    }
};

export const createOffering = async (req: Request, res: Response) => {
    try {
        const [event, badge] = await Promise.all([
            Event.findByPk(req.params.id),
            Badge.findByPk(req.body.badge_id)
        ]);

        if (!event) {
            throw new Error('Event to add offering to not found');
        }

        if (!badge) {
            throw new Error('Badge does not exist');
        }

        const offering: Offering = await event.$add('offering', req.body.badge_id, { through: req.body.offering }) as Offering;

        if (!offering) {
            throw new Error('Could not create offering');
        }

        const eventWithOffering: EventOfferingInterface = await Event.findByPk(req.params.id, {
            include: [{
                model: Badge,
                as: 'offerings',
                through: <any>{
                    as: 'details'
                }
            }]
        });

        return res.status(status.CREATED).json(<CreateOfferingResponseDto>{
            message: 'Offering created successfully',
            event: eventWithOffering
        });
    } catch (err) {
        return res.status(status.BAD_REQUEST).json(<ErrorResponseInterface>{
            message: 'Failed to create offering',
            error: err
        });
    }
};

export const createPurchasable = async (req: Request, res: Response) => {
    try {
        const purchasable: Purchasable = await Purchasable.create(req.body);
        let event: Event = await Event.findByPk(req.params.id);

        await event.$add('purchasable', purchasable);

        event = await Event.findByPk(req.params.id, {
            include: [{
                model: Purchasable,
                as: 'purchasables'
            }]
        });

        return res.status(status.CREATED).json(<PurchasablesResponseInterface>{
            message: 'Purchasable successfully created',
            purchasables: event.purchasables
        });
    } catch (err) {
        return res.status(status.BAD_REQUEST).json(<ErrorResponseInterface>{
            message: 'Failed to create purchasable',
            error: err
        });
    }
};
