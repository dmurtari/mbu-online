import { Model, FindAttributeOptions } from 'sequelize';
import { Request, Response } from 'express';
import status from 'http-status-codes';
import { cloneDeep } from 'lodash';

import { ErrorResponseInterface } from '@interfaces/shared.interface';
import registrationInformation from '@models/queries/registrationInformation';
import { Registration } from '@models/registration.model';
import { Offering } from '@models/offering.model';
import { Purchasable } from '@models/purchasable.model';

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

export const getPreferences = async (req: Request, res: Response) => {
    getRegistrationDetails(req, res, 'preferences');
};

export const getAssignments = async (req: Request, res: Response) => {
    getRegistrationDetails(req, res, 'assignments');
};

export const getPurchases = async (req: Request, res: Response) => {
    getRegistrationDetails(req, res, 'purchases');
};

interface QueryDetailInterface {
    model: typeof Model;
    modelAttributes?: FindAttributeOptions;
    joinAttributes: FindAttributeOptions;
}

async function getRegistrationDetails(req: Request, res: Response, target: 'preferences'|'assignments'|'purchases'): Promise<Response> {
    const detailQueryMap: { [key: string]: QueryDetailInterface } = {
        preferences: {
            model: Offering,
            modelAttributes: ['badge_id', ['id', 'offering_id']],
            joinAttributes: ['rank']
        },
        assignments: {
            model: Offering,
            modelAttributes: ['badge_id', ['id', 'offering_id']],
            joinAttributes: ['periods', 'completions']
        },
        purchases: {
            model: Purchasable,
            joinAttributes: ['quantity', 'size']
        }
    };

    try {
        const registration: Registration = await Registration.findOne({
            where: {
                id: req.params.registrationId,
                scout_id: req.params.scoutId
            },
            include: [{
                model: detailQueryMap[target].model,
                as: target,
                attributes: detailQueryMap[target].modelAttributes,
                through: {
                    as: 'details',
                    attributes: detailQueryMap[target].joinAttributes
                }
            }]
        });

        return res.status(status.OK).send(registration[target]);
    } catch (err) {
        return res.status(status.BAD_REQUEST).send(<ErrorResponseInterface>{
            message: `Failed to get ${target}`,
            error: err
        });
    }
}


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
