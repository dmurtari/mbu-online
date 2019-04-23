import { Request, Response } from 'express';
import status from 'http-status-codes';

import { ErrorResponseInterface } from '@interfaces/shared.interface';
import { Scout } from '@models/scout.model';
import { Event } from '@models/event.model';

export const deleteRegistration = async (req: Request, res: Response) => {
    try {
        const scout: Scout = await Scout.findByPk(req.params.scoutId);

        if (!scout) {
            throw new Error('Scout not found');
        }

        if (!(await Event.findByPk(req.params.eventId))) {
            throw new Error('No registration to delete');
        }

        await scout.$remove('registration', req.params.eventId);

        return res.status(status.OK).end();
    } catch (err) {
        return res.status(status.BAD_REQUEST).json(<ErrorResponseInterface>{
            message: `Could not unregister ${req.params.scoutId} from event ${req.params.eventId}`,
            error: err
        });
    }
};


// var status = require('http-status-codes');

// var Models = require('../../models');

// module.exports = {
//   deleteRegistration: function (req, res) {
//     var scoutId = req.params.scoutId;
//     var eventId = req.params.eventId;

//     return Models.Scout.findById(scoutId)
//       .then(function (scout) {
//         return scout.removeRegistration(eventId);
//       })
//       .then(function (deleted) {
//         if (!deleted) {
//           throw new Error('No registration to delete');
//         }

//         res.status(status.OK).end();
//       })
//       .catch(function (err) {
//         res.status(status.BAD_REQUEST).json({
//           message: 'Could not unregister ' + eventId + ' from scout ' + scoutId,
//           error: err
//         });
//       });
//   },
//   deletePreference: function (req, res) {
//     var scoutId = req.params.scoutId;
//     var registrationId = req.params.registrationId;
//     var offeringId = req.params.offeringId;

//     return Models.Registration.find({
//       where: {
//         id: registrationId,
//         scout_id: scoutId
//       }
//     })
//       .then(function (registration) {
//         return registration.removePreference(offeringId);
//       })
//       .then(function (deleted) {
//         if (!deleted) {
//           throw new Error('No preference to delete');
//         }

//         res.status(status.OK).end();
//       })
//       .catch(function (err) {
//         res.status(status.BAD_REQUEST).json({
//           message: 'Could not remove preference ' + offeringId + ' for registration ' + registrationId,
//           error: err
//         });
//       });
//   },
//   deleteAssignment: function (req, res) {
//     var scoutId = req.params.scoutId;
//     var registrationId = req.params.registrationId;
//     var offeringId = req.params.offeringId;

//     return Models.Registration.find({
//       where: {
//         id: registrationId,
//         scout_id: scoutId
//       }
//     })
//       .then(function (registration) {
//         return registration.removeAssignment(offeringId);
//       })
//       .then(function (deleted) {
//         if (!deleted) {
//           throw new Error('No assignment to delete');
//         }

//         res.status(status.OK).end();
//       .catch(function (err) {
//       })
//         res.status(status.BAD_REQUEST).json({
//           message: 'Could not remove assignment ' + offeringId + ' for registration ' + registrationId,
//           error: err
//         });
//       });
//   },
//   deletePurchase: function (req, res) {
//     var scoutId = req.params.scoutId;
//     var registrationId = req.params.registrationId;
//     var purchasableId = req.params.purchasableId;

//     return Models.Registration.find({
//       where: {
//         id: registrationId,
//         scout_id: scoutId
//       }
//     })
//       .then(function (registration) {
//         return registration.removePurchase(purchasableId);
//       })
//       .then(function (deleted) {
//         if (!deleted) {
//           throw new Error('No purchase to delete');
//         }

//         res.status(status.OK).end();
//       })
//       .catch(function (err) {
//         res.status(status.BAD_REQUEST).json({
//           message: 'Could not remove purchasable ' + purchasableId + ' for registration ' + registrationId,
//           error: err
//         });
//       });
//   }
// };
