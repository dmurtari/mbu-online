import { Request, Response } from 'express';
import status from 'http-status-codes';

import { Event } from '@models/event.model';
import { EventResponseInterface } from '@app/interfaces/event.interface';
import { ErrorResponseInterface } from '@app/interfaces/shared.interface';
import { Badge } from '@models/badge.model';
import { Offering } from '@models/offering.model';
import { OfferingResponseInterface } from '@interfaces/offering.interface';

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

        return res.status(status.OK).json(<EventResponseInterface>{
            message: 'Event updated successfully',
            event: event
        });
    } catch (err) {
        return res.status(status.BAD_REQUEST).json(<ErrorResponseInterface>{
            message: 'Error updating event' ,
            error: err
        });
    }
};

export const updateOffering = async (req: Request, res: Response) => {
    try {
        let offering: Offering = await Offering.findOne({
            where: {
                badge_id: req.params.badgeId,
                event_id: req.params.eventId
            }
        });

        if (!offering) {
            throw new Error('Offering to update not found');
        }

        offering = await offering.update(req.body);

        return res.status(status.OK).json(<OfferingResponseInterface> {
            message: 'Offering updated successfully',
            offering: offering
        });
    } catch (err) {
        return res.status(status.BAD_REQUEST).json(<ErrorResponseInterface>{
            message: 'Error updating offering' ,
            error: err
        });
    }
};

//   updateOffering: function (req, res) {
//     var offeringUpdate = req.body;
//     var eventId = req.params.eventId;
//     var badgeId = req.params.badgeId;

//     Model.Event.findById(eventId, {
//       include: [{
//         model: Model.Badge,
//         as: 'offerings'
//       }]
//     })
//       .then(function (event) {
//         if (!event) {
//           throw new Error('Event to update not found');
//         }

//         return event.getOfferings({
//           where: {
//             id: badgeId
//           }
//         });
//       })
//       .then(function (offerings) {
//         var offering = offerings[0];
//         return offering.Offering.update(offeringUpdate);
//       })
//       .then(function (offering) {
//         res.status(status.OK).json({
//           message: 'Offering updated successfully',
//           offering: offering
//         });
//       })
//       .catch(function (err) {
//         res.status(status.BAD_REQUEST).json({
//           message: 'Error updating offering',
//           error: err
//         });
//       });
//   },
//   updatePurchasable: function (req, res) {
//     var purchasableUpdate = req.body;
//     var purchasableId = req.params.purchasableId;
//     var eventId = req.params.eventId;

//     Model.Event.findById(eventId)
//       .then(function (event) {
//         if (!event) {
//           throw new Error('event to update not found');
//         }

//         return event.getPurchasables({
//           where: {
//             id: purchasableId
//           }
//         });
//       })
//       .then(function (purchasables) {
//         var purchasable = purchasables[0];
//         return purchasable.update(purchasableUpdate);
//       })
//       .then(function (purchasable) {
//         res.status(status.OK).json({
//           message: 'Purchasable updated successfully',
//           purchasable: purchasable
//         });
//       })
//       .catch(function (err) {
//         res.status(status.BAD_REQUEST).json({
//           message: 'Error updating purchasable',
//           error: err
//         });
//       });
//   }
// };
