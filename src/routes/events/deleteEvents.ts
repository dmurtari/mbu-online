import { Request, Response } from 'express';
import status from 'http-status-codes';

import { Event } from '@models/event.model';
import { ErrorResponseDto } from '@app/interfaces/shared.interface';
import { Purchasable } from '@models/purchasable.model';
import { Offering } from '@models/offering.model';

export const deleteEvent = async (req: Request, res: Response) => {
    try {
        const event: Event = await Event.findByPk(req.params.id);
        await event.destroy();

        return res.status(status.OK).end();
    } catch (err) {
        return res.status(status.BAD_REQUEST).json(<ErrorResponseDto>{
            message: 'Failed to delete event',
            error: err
        });
    }
};

export const deleteOffering = async (req: Request, res: Response) => {
    try {
        const offering: Offering = await Offering.findOne({
            where: {
                badge_id: req.params.badgeId,
                event_id: req.params.eventId
            }
        });

        if (!offering) {
            throw new Error('Badge to remove as offering does not exist');
        }

        await offering.destroy();

        return res.status(status.OK).end();
    } catch (err) {
        return res.status(status.BAD_REQUEST).json(<ErrorResponseDto>{
            message: 'Failed to delete offering',
            error: err
        });
    }
};

export const deletePurchasable = async (req: Request, res: Response) => {
    try {
        const [event, purchasable] = await Promise.all([
            Event.findByPk(req.params.eventId),
            Purchasable.findByPk(req.params.purchasableId)
        ]);

        if (!purchasable || !event) {
            throw new Error('Purchasable to remove not found');
        }

        await purchasable.destroy();

        return res.status(status.OK).end();
    } catch (err) {
        return res.status(status.BAD_REQUEST).json(<ErrorResponseDto>{
            message: 'Failed to delete purchasable',
            error: err
        });
    }
};
