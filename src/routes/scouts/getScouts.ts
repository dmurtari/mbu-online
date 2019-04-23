import { Request, Response } from 'express';
import status from 'http-status-codes';
import { cloneDeep } from 'lodash';

import { ErrorResponseInterface } from '@interfaces/shared.interface';
import registrationInformation from '@models/queries/registrationInformation';
import { Registration } from '@models/registration.model';

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

// var status = require('http-status-codes');
// var _ = require('lodash');

// var Models = require('../../models');
// var registrationInformation = require('../../models/queries/registrationInformation');

// module.exports = {
//   getAll: function (req, res) {
//     Models.Scout.findAll({
//       attributes: [['id', 'scout_id'], 'firstname', 'lastname', 'troop', 'notes',
//         'emergency_name', 'emergency_relation', 'emergency_phone'],
//       include: [{
//         model: Models.Event,
//         as: 'registrations',
//         attributes: [['id', 'event_id'], 'year', 'semester'],
//         through: {
//           as: 'details'
//         },
//       }, {
//         model: Models.User,
//         as: 'user',
//         attributes: [['id', 'user_id'], 'firstname', 'lastname', 'email']
//       }]
//     })
//       .then(function (scouts) {
//         res.status(status.OK).json(scouts);
//       })
//       .catch(function (err) {
//         res.status(status.BAD_REQUEST).send(err);
//       });
//   },
//   getScout: function (req, res) {
//     Models.Scout.findById(req.params.scoutId, {
//       attributes: [['id', 'scout_id'], 'firstname', 'lastname', 'troop', 'notes',
//         'emergency_name', 'emergency_relation', 'emergency_phone',
//         'birthday', 'created_at'],
//       include: [{
//         model: Models.Event,
//         as: 'registrations',
//         attributes: [['id', 'event_id'], 'year', 'semester'],
//         through: {
//           as: 'details'
//         },
//       }, {
//         model: Models.User,
//         as: 'user',
//         attributes: [['id', 'user_id'], 'firstname', 'lastname', 'email', 'details']
//       }]
//     })
//       .then(function (scouts) {
//         res.status(status.OK).json(scouts);
//       })
//       .catch(function (err) {
//         res.status(status.BAD_REQUEST).json(err);
//       });
//   },
//   getPreferences: function (req, res) {
//     getRegistrationDetails(req, res, 'preferences');
//   },
//   getAssignments: function (req, res) {
//     getRegistrationDetails(req, res, 'assignments');
//   },
//   getPurchases: function (req, res) {
//     getRegistrationDetails(req, res, 'purchases');
//   },
//   getProjectedCost: function (req, res) {
//     getCost(req, res, 'projectedCost');
//   },
//   getActualCost: function (req, res) {
//     getCost(req, res, 'actualCost');
//   }
// };

// function getRegistrationDetails(req, res, object) {
//   var scoutId = req.params.scoutId;
//   var registrationId = req.params.registrationId;

//   var possibleQueries = {
//     'preferences': {
//       model: Models.Offering,
//       modelAttributes: ['badge_id', ['id', 'offering_id']],
//       joinAttributes: ['rank']
//     },
//     'assignments': {
//       model: Models.Offering,
//       modelAttributes: ['badge_id', ['id', 'offering_id']],
//       joinAttributes: ['periods', 'completions']
//     },
//     'purchases': {
//       model: Models.Purchasable,
//       joinAttributes: ['quantity', 'size']
//     }
//   };

//   if (object in possibleQueries) {
//     return Models.Registration.find({
//       where: {
//         id: registrationId,
//         scout_id: scoutId
//       },
//       include: [{
//         model: possibleQueries[object].model,
//         as: object,
//         attributes: possibleQueries[object].modelAttributes,
//         through: {
//           as: 'details',
//           attributes: possibleQueries[object].joinAttributes
//         }
//       }]
//     })
//       .then(function (registration) {
//         res.status(status.OK).json(registration[object]);
//       })
//       .catch(function () {
//         res.status(status.BAD_REQUEST).end();
//       });
//   } else {
//     return res.status(status.INTERNAL_SERVER_ERROR);
//   }
// }

// function getCost(req, res, type) {
//   var scoutId = req.params.scoutId;
//   var registrationId = req.params.registrationId;

//   return Models.Registration.find({
//     where: {
//       id: registrationId,
//       scout_id: scoutId
//     }
//   })
//     .then(function (registration) {
//       return registration[type]();
//     })
//     .then(function (cost) {
//       res.status(status.OK).json({
//         cost: String(cost.toFixed(2))
//       });
//     })
//     .catch(function () {
//       res.status(status.BAD_REQUEST).end();
//     });
// }
