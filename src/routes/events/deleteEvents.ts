import { Request, Response } from 'express';
import status from 'http-status-codes';

import { Event } from '@models/event.model';
import { ErrorResponseInterface } from '@app/interfaces/shared.interface';

export const deleteEvent = async (req: Request, res: Response) => {
    try {
        const event: Event = await Event.findByPk(req.params.id);
        await event.destroy();

        return res.status(status.OK).end();
    } catch (err) {
        return res.status(status.BAD_REQUEST).json(<ErrorResponseInterface>{
            message: 'Failed to delete event',
            error: err
        });
    }
};

//   deleteOffering: function (req, res) {
//     var eventId = req.params.eventId;
//     var badgeId = req.params.badgeId;

//     Model.Event.findById(eventId)
//       .then(function (event) {
//         return event.removeOfferings(badgeId);
//       })
//       .then(function () {
//         return res.status(status.OK).end();
//       })
//       .catch(function () {
//         return res.status(status.BAD_REQUEST).end();
//       });
//   },
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
