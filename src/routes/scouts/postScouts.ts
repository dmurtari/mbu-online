import { Request, Response } from 'express';
import status from 'http-status-codes';

import { Scout } from '@models/scout.model';
import { Registration } from '@models/registration.model';
import { ErrorResponseInterface } from '@interfaces/shared.interface';
import { RegistrationInterface, RegistrationResponseInterface } from '@interfaces/registration.interface';
import { Event } from '@models/event.model';
import { Preference } from '@models/preference.model';
import { PreferenceRequestInterface, PreferenceInterface } from '@interfaces/preference.interface';
import { Offering } from '@models/offering.model';
import { Assignment } from '@models/assignment.model';
import { AssignmentInterface, AssignmentRequestInterface, AssignmentResponseInterface } from '@interfaces/assignment.interface';
import { Badge } from '@models/badge.model';

export const createRegistration = async (req: Request, res: Response) => {
    try {
        const [scout, event] = await Promise.all([
            Scout.findByPk(req.params.scoutId),
            Event.findByPk(req.body.event_id)
        ]);

        if (!scout) {
            throw new Error('Scout to add registration for not found');
        }

        if (!event) {
            throw new Error('Event to add registration for not found');
        }

        const registration = await Registration.create({
            scout_id: req.params.scoutId,
            event_id: req.body.event_id,
            notes: req.body.notes
        });

        return res.status(status.CREATED).json(<RegistrationInterface>{
            message: 'Scout successfully registered for event',
            registration: registration
        });
    } catch (err) {
        return res.status(status.BAD_REQUEST).json(<ErrorResponseInterface>{
            message: 'Registration could not be created',
            error: 'err'
        });
    }
};

export const createPreference = async (req: Request, res: Response) => {
    try {
        const scoutId = req.params.scoutId;
        const registrationId = req.params.registrationId;

        if (Array.isArray(req.body)) {
            await Preference.destroy({
                where: {
                    registration_id: registrationId
                }
            });

            const preferences: PreferenceInterface[] = req.body.map((preference: PreferenceRequestInterface) => ({
                registration_id: registrationId,
                offering_id: preference.offering,
                rank: preference.rank
            }));

            await Preference.bulkCreate(preferences, {
                individualHooks: true,
                validate: true
            });
        } else {
            const registration: Registration = await Registration.findOne({
                where: {
                    id: registrationId,
                    scout_id: scoutId
                }
            });

            await registration.$add('preference', req.body.offering, {
                through: {
                    rank: req.body.rank
                }
            });
        }

        const createdRegistration: Registration = await Registration.findByPk(registrationId, {
            include: [{
                model: Offering,
                as: 'preferences',
                attributes: ['badge_id', ['id', 'offering_id']],
                through: {
                    as: 'details',
                    attributes: ['rank']
                }
            }]
        });

        return res.status(status.CREATED).json(<RegistrationResponseInterface>{
            message: 'Preference created',
            registration: createdRegistration
        });
    } catch (err) {
        return res.status(status.BAD_REQUEST).json(<ErrorResponseInterface>{
            message: 'Preference could not be created',
            error: 'err'
        });
    }
};

export const createAssignment = async (req: Request, res: Response) => {
    try {
        const registrationId = req.params.registrationId;
        let assignments: AssignmentInterface[];

        if (Array.isArray(req.body)) {
            await Assignment.destroy({
                where: {
                    registration_id: registrationId
                }
            });

            assignments = req.body.map((assignment: AssignmentRequestInterface) => ({
                registration_id: registrationId,
                offering_id: assignment.offering,
                periods: assignment.periods,
                completions: assignment.completions
            }));

        } else {
            assignments = [{
                registration_id: registrationId,
                offering_id: req.body.offering,
                periods: req.body.periods,
                completions: req.body.completions
            }];
        }

        await Assignment.bulkCreate(assignments, {
            individualHooks: true,
            validate: true
        });

        const createdRegistration: Registration = await Registration.findByPk(registrationId, {
            include: [{
                model: Offering,
                as: 'assignments',
                attributes: ['badge_id', ['id', 'offering_id'], 'price'],
                through: {
                    as: 'details',
                    attributes: ['periods', 'completions']
                },
                include: [{
                    model: Badge,
                    as: 'badge',
                    attributes: ['name']
                }]
            }],
        });

        return res.status(status.CREATED).json(<RegistrationResponseInterface>{
            message: 'Assignment created successfully',
            registration: createdRegistration
        });
    } catch (err) {
        return res.status(status.BAD_REQUEST).json(<ErrorResponseInterface>{
            message: 'Assignment could not be created',
            error: 'err'
        });
    }
};

//   createAssignment: function (req, res) {
//     var scoutId = req.params.scoutId;
//     var registrationId = req.params.registrationId;

//     return Models.Registration.find({
//         where: {
//           id: registrationId,
//           scout_id: scoutId
//         }
//       })
//       .then(function (registration) {
//         if (Array.isArray(req.body)) {
//           // Update assignments, override existing
//           return Models.Assignment.destroy({
//               where: {
//                 registration_id: registrationId
//               }
//             })
//             .then(function () {
//               var assignments = _.map(req.body, function (assignment) {
//                 return {
//                   registration_id: registrationId,
//                   offering_id: assignment.offering,
//                   periods: assignment.periods,
//                   completions: assignment.completions
//                 };
//               });

//               return Models.Assignment.bulkCreate(assignments, {
//                 validate: true,
//                 individualHooks: true
//               });
//             })
//             .catch(function () {
//               throw new Error('Failed to destroy existing assignments');
//             });
//         } else {
//           // Add assignment, without overriding
//           return registration.addAssignment(req.body.offering, {
//             individualHooks: true,
//             through: {
//               periods: req.body.periods
//             }
//           });
//         }
//       })
//       .then(function () {
//         return Models.Registration.findById(registrationId, {
//           include: [{
//             model: Models.Offering,
//             as: 'assignments',
//             attributes: ['badge_id', ['id', 'offering_id'], 'price'],
//             through: {
//               as: 'details',
//               attributes: ['periods', 'completions']
//             },
//             include: [{
//               model: Models.Badge,
//               as: 'badge',
//               attributes: ['name']
//             }]
//           }]
//         });
//       })
//       .then(function (registration) {
//         res.status(status.CREATED).json({
//           message: 'Assignment created for period(s) ' + req.body.periods,
//           registration: registration
//         });
//       })
//       .catch(function (err) {
//         res.status(status.BAD_REQUEST).json({
//           message: 'Assignment could not be created',
//           error: err
//         });
//       });
//   },
//   createPurchase: function (req, res) {
//     var scoutId = req.params.scoutId;
//     var registrationId = req.params.registrationId;

//     return Models.Registration.find({
//         where: {
//           id: registrationId,
//           scout_id: scoutId
//         }
//       })
//       .then(function (registration) {
//         return registration.addPurchase(req.body.purchasable, {
//           through: {
//             quantity: req.body.quantity,
//             size: req.body.size
//           }
//         });
//       })
//       .then(function () {
//         return Models.Registration.findById(registrationId, {
//           include: [{
//             model: Models.Purchasable,
//             as: 'purchases',
//             through: {
//               as: 'details',
//               attributes: ['size', 'quantity']
//             }
//           }]
//         });
//       })
//       .then(function (registration) {
//         res.status(status.CREATED).json({
//           message: 'Purchase created',
//           registration: registration
//         });
//       })
//       .catch(function (err) {
//         res.status(status.BAD_REQUEST).json({
//           message: 'Purchase could not be created',
//           error: err
//         });
//       });
//   }
// };
