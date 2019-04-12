import { Request, Response } from 'express';
import status from 'http-status-codes';

import { Event } from '@models/event.model';
import { EventResponseInterface, CurrentEventResponseInterface } from '@app/interfaces/event.interface';
import { ErrorResponseInterface } from '@app/interfaces/shared.interface';
import { CurrentEvent } from '@models/currentEvent.model';
import { Offering } from '@models/offering.model';
import { Badge } from '@models/badge.model';

export const createEvent = async (req: Request, res: Response) => {
    try {
        const event: Event = await Event.create(req.body);
        return res.status(status.CREATED).json(<EventResponseInterface>{
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

        return res.status(status.OK).json(<CurrentEventResponseInterface>{
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
        let event: Event = await Event.findByPk(req.params.id);

        if (!event) {
            throw new Error('Event to add offering to not found');
        }

        const offering: Offering = await event.$add('offering', req.body.badge_id, { through: req.body.offering }) as Offering;

        if (!offering) {
            throw new Error('Could not create offering');
        }

        event = await Event.findByPk(req.params.id, {
            include: [{
                model: Badge,
                as: 'offerings'
            }]
        });

        return res.status(status.CREATED).json(<EventResponseInterface>{
            message: 'Offering created successfully',
            event: event
        });
    } catch (err) {
        return res.status(status.BAD_REQUEST).json(<ErrorResponseInterface>{
            message: 'Failed to create offering',
            error: err
        });
    }
};

//   createOffering: function (req, res) {
//     var eventId = req.params.id;

//     Model.Event.findById(eventId)
//       .then(function (event) {
//         return event.addOffering(req.body.badge_id, { through: req.body.offering });
//       })
//       .then(function (offering) {
//         if (!offering) {
//           throw new Error('Could not create offering');
//         }

//         return Model.Event.findById(eventId, {
//           include: [{
//             model: Model.Badge,
//             as: 'offerings',
//             through: {
//               as: 'details'
//             }
//           }]
//         });
//       })
//       .then(function (event) {
//         res.status(status.CREATED).json({
//           message: 'Offering successfully created',
//           event: event
//         });
//       })
//       .catch(function (err) {
//         res.status(status.BAD_REQUEST).json({
//           message: 'Offering creation failed',
//           error: err
//         });
//       });
//   },
//   createPurchasable: function (req, res) {
//     var eventId = req.params.id;
//     var purchasable;

//     Model.Purchasable.create(req.body)
//       .then(function (createdPurchasable) {
//         purchasable = createdPurchasable;
//         return Model.Event.findById(eventId);
//       })
//       .then(function (event) {
//         return event.addPurchasable(purchasable);
//       })
//       .then(function (event) {
//         if (!event) {
//           throw new Error('Could not create purchasable');
//         }

//         return Model.Event.findById(eventId, {
//           include: [{
//             model: Model.Purchasable,
//             as: 'purchasables'
//           }]
//         });
//       })
//       .then(function (event) {
//         res.status(status.CREATED).json({
//           message: 'Purchasable successfully created',
//           purchasables: event.purchasables
//         });
//       })
//       .catch(function (err) {
//         res.status(status.BAD_REQUEST).json({
//           message: 'Purchasable creation failed',
//           error: err
//         });
//       });
//   },
//   setCurrentEvent: function (req, res) {
//     var eventId = req.body.id;
//     var event;

//     Model.Event.findById(eventId)
//       .then(function (eventFromDb) {
//         if (!eventFromDb) {
//           throw new Error('Event to set as current not found');
//         }

//         event = eventFromDb;
//         return Model.CurrentEvent.findOne();
//       })
//       .then(function (currentEvent) {
//         if (!currentEvent) {
//           return Model.CurrentEvent.create({});
//         }
//         return currentEvent;
//       })
//       .then(function (currentEvent) {
//         return currentEvent.setEvent(event, {
//           include: [{
//             model: Model.Event
//           }]
//         });
//       })
//       .then(function (currentEvent) {
//         return Model.Event.findById(currentEvent.event_id);
//       })
//       .then(function (event) {
//         res.status(status.OK).json({
//           message: 'Current event set',
//           currentEvent: event
//         });
//       })
//       .catch(function (err) {
//         res.status(status.BAD_REQUEST).json({
//           message: 'Setting current event failed',
//           error: err
//         });
//       });
//   }
// };
