import { Request, Response } from 'express';
import status from 'http-status-codes';

import { Event } from '@models/event.model';
import { EventResponseDto } from '@interfaces/event.interface';
import { ErrorResponseDto } from '@interfaces/shared.interface';
import { Badge } from '@models/badge.model';
import { Offering } from '@models/offering.model';
import { OfferingResponseDto } from '@interfaces/offering.interface';
import { Purchasable } from '@models/purchasable.model';
import { UpdatePurchasableResponseDto } from '@interfaces/purchasable.interface';

export const updateEvent = async (req: Request, res: Response) => {
    try {
        const event: Event = await Event.findByPk(req.params.id, {
            include: [{
                model: Badge,
                as: 'offerings',
                through: <any> {
                    as: 'details'
                }
            }]
        });

        if (!event) {
            throw new Error('Event to update not found');
        }

        await event.update(req.body);

        return res.status(status.OK).json(<EventResponseDto>{
            message: 'Event updated successfully',
            event: event
        });
    } catch (err) {
        return res.status(status.BAD_REQUEST).json(<ErrorResponseDto>{
            message: 'Error updating event' ,
            error: err
        });
    }
};

export const updateOffering = async (req: Request, res: Response) => {
    try {
        const offering: Offering = await Offering.findOne({
            where: {
                badge_id: req.params.badgeId,
                event_id: req.params.eventId
            }
        });

        if (!offering) {
            throw new Error('Offering to update not found');
        }

        await offering.update(req.body);

        return res.status(status.OK).json(<OfferingResponseDto> {
            message: 'Offering updated successfully',
            offering: offering
        });
    } catch (err) {
        return res.status(status.BAD_REQUEST).json(<ErrorResponseDto>{
            message: 'Error updating offering' ,
            error: err
        });
    }
};

export const updatePurchasable = async (req: Request, res: Response) => {
    try {
        const purchasable: Purchasable = await Purchasable.findOne({
            where: {
                event_id: req.params.eventId,
                id: req.params.purchasableId
            }
        });

        if (!purchasable) {
            throw new Error('Purchasable to update not found');
        }

        await purchasable.update(req.body);

        return res.status(status.OK).json(<UpdatePurchasableResponseDto>{
            message: 'Purchasable updated successfully',
            purchasable: purchasable
        });
    } catch (err) {
        return res.status(status.BAD_REQUEST).json(<ErrorResponseDto>{
            message: 'Error updating purchasable',
            error: err
        });
    }
};
