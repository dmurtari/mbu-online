import { Request, Response} from 'express';
import status from 'http-status-codes';

import { ErrorResponseInterface } from '@interfaces/shared.interface';
import { Registration } from '@models/registration.model';
import { Preference } from '@models/preference.model';
import { PreferenceResponseInterface } from '@interfaces/preference.interface';

export const updatePreference = async (req: Request, res: Response) => {
    try {
        const [registration, preference]: [Registration, Preference] = await Promise.all([
            Registration.findOne({
                where: {
                    id: req.params.registrationId,
                    scout_id: req.params.scoutId
                }
            }),
            Preference.findOne({
                where: {
                    offering_id: req.params.offeringId,
                    registration_id: req.params.registrationId
                }
            })
        ]);

        if (!registration) {
            throw new Error('Registration to update not found');
        }

        if (!preference) {
            throw new Error('Preference to update not found');
        }

        await preference.update(req.body);

        return res.status(status.OK).json(<PreferenceResponseInterface> {
            message: 'Preference updated successfully',
            preference: preference
        });

    } catch (err) {
        return res.status(status.BAD_REQUEST).json(<ErrorResponseInterface>{
            message: 'Error updating preference',
            error: err
        });
    }
};

//   updateAssignment: function (req, res) {
//     var scoutId = req.params.scoutId;
//     var registrationId = req.params.registrationId;
//     var offeringId = req.params.offeringId;
//     var assignmentUpdate = req.body;

//     return Models.Registration.find({
//       where: {
//         id: registrationId,
//         scout_id: scoutId
//       }
//     })
//       .then(function (registration) {
//         return registration.getAssignments({
//           where: {
//             id: offeringId
//           }
//         });
//       })
//       .then(function (assignments) {
//         if (assignments.length < 1) {
//           throw new Error('No assignments found');
//         } else if (assignments.length > 1) {
//           throw new Error('Duplicate assignments exist');
//         }

//         var assignment = assignments[0];
//         return assignment.Assignment.update(assignmentUpdate);
//       })
//       .then(function (assignment) {
//         res.status(status.OK).json({
//           message: 'Assignment updated successfully',
//           assignment: assignment
//         });
//       })
//       .catch(function (err) {
//         res.status(status.BAD_REQUEST).json({
//           message: 'Error updating assignment',
//           error: err
//         });
//       });
//   },
//   updatePurchase: function (req, res) {
//     var scoutId = req.params.scoutId;
//     var registrationId = req.params.registrationId;
//     var purchasableId = req.params.purchasableId;
//     var purchaseUpdate = req.body;

//     return Models.Registration.find({
//       where: {
//         id: registrationId,
//         scout_id: scoutId
//       }
//     })
//       .then(function (registration) {
//         return registration.getPurchases({
//           where: {
//             id: purchasableId
//           }
//         });
//       })
//       .then(function (purchases) {
//         if (purchases.length < 1) {
//           throw new Error('No purchase found');
//         } else if (purchases.length > 1) {
//           throw new Error('Duplicate purchases exist');
//         }

//         var purchase = purchases[0];
//         return purchase.Purchase.update(purchaseUpdate);
//       })
//       .then(function (purchase) {
//         res.status(status.OK).json({
//           message: 'Purchase updated successfully',
//           purchase: purchase
//         });
//       })
//       .catch(function (err) {
//         res.status(status.BAD_REQUEST).json({
//           message: 'Error updating purchase',
//           error: err
//         });
//       });
//   }
// };
