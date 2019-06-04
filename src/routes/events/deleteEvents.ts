import { Request, Response } from 'express';
import status from 'http-status-codes';

import { Event } from '@models/event.model';
import { ErrorResponseDto } from '@app/interfaces/shared.interface';
import { Badge } from '@models/badge.model';
import { Purchasable } from '@models/purchasable.model';

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
        const [event, badge] = await Promise.all([
            Event.findByPk(req.params.eventId),
            Badge.findByPk(req.params.badgeId)
        ]);

        if (!badge) {
            throw new Error('Badge to remove as offering does not exist');
        }

        await event.$remove('offerings', req.params.badgeId);

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

        if (!purchasable) {
            throw new Error('Purchasable to remove not found');
        }

        await event.$remove('purchasables', req.params.purchasableId);

        return res.status(status.OK).end();
    } catch (err) {
        return res.status(status.BAD_REQUEST).json(<ErrorResponseDto>{
            message: 'Failed to delete purchasable',
            error: err
        });
    }
};

//   deletePurchasable: function (req, res) {
//     var eventId = req.params.eventId;
//     var purchasableId = req.params.purchasableId;

//     Model.Event.findById(eventId)
//       .then(function (event) {
//         return event.removePurchasables(purchasableId);
//       })
//       .then(function () {
//         return res.status(status.OK).end();
//       })
//       .catch(function () {
//         return res.status(status.BAD_REQUEST).end();
//       });
//   }
// };
