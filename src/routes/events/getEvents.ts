import { Request, Response } from 'express';
import { WhereOptions } from 'sequelize';
import status from 'http-status-codes';
import { cloneDeep } from 'lodash';

import { CurrentEvent } from '@models/currentEvent.model';
import { Event } from '@models/event.model';
import { ErrorResponseInterface } from '@app/interfaces/shared.interface';
import { Badge } from '@models/badge.model';
import { Purchasable } from '@models/purchasable.model';
import { EventInterface } from '@interfaces/event.interface';
import { Offering } from '@models/offering.model';
import registrationInformation from '@models/queries/registrationInformation';
import { Registration } from '@models/registration.model';

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
                through: <any> {
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
        res.status(status.BAD_REQUEST).json(<ErrorResponseInterface>{
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
        res.status(status.BAD_REQUEST).json(<ErrorResponseInterface>{
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
        res.status(status.BAD_REQUEST).json(<ErrorResponseInterface>{
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
        res.status(status.BAD_REQUEST).json(<ErrorResponseInterface>{
            message: 'Failed to get registrations',
            error: err
        });
    }
};


//   getAssignees: function (req, res) {
//     var eventId = req.params.id;

//     Model.Offering.findAll({
//       where: {
//         event_id: eventId
//       },
//       attributes: [['id', 'offering_id'], 'duration', 'periods', 'requirements'],
//       include: [{
//         model: Model.Badge,
//         as: 'badge',
//         attributes: ['name', ['id', 'badge_id']]
//       }, {
//         model: Model.Registration,
//         as: 'assignees',
//         attributes: {
//           exclude: ['projectedCost', 'actualCost'],
//           include: [['id', 'registration_id'], 'notes'],
//         },
//         through: {
//           as: 'assignment',
//           attributes: ['periods', 'completions']
//         },
//         include: [{
//           model: Model.Scout,
//           as: 'scout',
//           attributes: ['firstname', 'lastname', 'troop']
//         }]
//       }]
//     })
//       .then(function (offerings) {
//         return res.status(status.OK).json(offerings);
//       })
//       .catch(function (err) {
//         res.status(status.BAD_REQUEST).end();
//       })
//   },
//   getRegistrations: function (req, res) {
//     var eventId = req.params.id;
//     var query = _.cloneDeep(registrationInformation);

//     query.where = {
//       event_id: eventId
//     };

//     Model.Registration.findAll(query)
//       .then(function (registrations) {
//         res.status(status.OK).json(registrations);
//       })
//       .catch(function () {
//         res.status(status.BAD_REQUEST).end();
//       });
//   },
//   getCurrentEvent: function (req, res) {
//     Model.CurrentEvent.findOne({
//       include: [{
//         model: Model.Event
//       }]
//     })
//       .then(function (currentEvent) {
//         res.status(status.OK).send(currentEvent.Event);
//       })
//       .catch(function () {
//         res.status(status.OK).end();
//       });
//   },
//   getPotentialIncome: function (req, res) {
//     income(req, res, 'projectedCost');
//   },
//   getIncome: function (req, res) {
//     income(req, res, 'actualCost');
//   },
//   getStats: function (req, res) {
//     var resultObject = {};

//     Model.Event.findById(req.params.id, {
//       include: [{
//         model: Model.Scout,
//         as: 'attendees',
//         attributes: ['id', 'firstname', 'lastname', 'troop']
//       }, {
//         model: Model.Badge,
//         as: 'offerings',
//         attributes: ['id', 'name'],
//       }]
//     })
//       .then(function (event) {
//         resultObject.scouts = event.attendees;
//         resultObject.offerings = event.offerings;

//         return Model.Registration.findAll({
//           where: {
//             event_id: req.params.id
//           },
//           attributes: ['scout_id'],
//           include: [{
//             model: Model.Purchasable,
//             as: 'purchases',
//             attributes: ['id', 'price', 'has_size'],
//             through: [{
//               as: 'details',
//               attributes: ['quantity', 'size']
//             }]
//           }]
//         });
//       })
//       .then(function (registrations) {
//         resultObject.registrations = registrations;

//       //   return Model.Purchasable.findAll({
//       //     where: {
//       //       event_id: req.params.id
//       //     },
//       //     attributes: ['id', 'price', 'has_size'],
//       //     include: [{
//       //       model: Model.Purchase,
//       //       as: 'sold',
//       //       attributes: ['quantity', 'size']
//       //     }]
//       //   })
//       // })
//       // .then(function (purchases) {
//       //   resultObject.purchases = purchases;
//         res.status(status.OK).send(resultObject);
//       })
//       .catch(function (err) {
//         res.status(status.BAD_REQUEST).send(err);
//       });
//   },
//   classSize(req, res) {
//     var offering;

//     Model.Offering.findOne({
//       where: {
//         badge_id: req.params.badgeId,
//         event_id: req.params.eventId
//       }
//     })
//       .then(function (offeringFromDb) {
//         offering = offeringFromDb;
//         return offeringFromDb.getClassSizes()
//       })
//       .then(function (results) {
//         res.status(status.OK).send(results);
//       })
//       .catch(function (err) {
//         res.status(status.BAD_REQUEST).send(err);
//       })
//   }
// };

// function income(req, res, type) {
//   var totalIncome = 0;

//   return Model.Registration.findAll({
//     where: {
//       event_id: req.params.id
//     }
//   })
//     .then(function (registrations) {
//       if (registrations.length < 1) {
//         throw new Error('No registrations found');
//       }

//       var items = _.map(registrations, function (registration) {
//         return registration[type]();
//       });

//       return Promise.all(items);
//     })
//     .then(function (costs) {
//       totalIncome = _.reduce(costs, function (sum, cost) {
//         return sum + cost;
//       }, totalIncome);

//       return res.status(status.OK).json({
//         income: String(totalIncome.toFixed(2))
//       });
//     })
//     .catch(function (err) {
//       return res.status(status.BAD_REQUEST).send(err);
//     });
// }
