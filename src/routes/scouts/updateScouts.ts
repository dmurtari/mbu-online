import { Request, Response } from 'express';
import status from 'http-status-codes';

import { ErrorResponseInterface } from '@interfaces/shared.interface';
import { Registration } from '@models/registration.model';
import { Preference } from '@models/preference.model';
import { PreferenceResponseInterface } from '@interfaces/preference.interface';
import { Assignment } from '@models/assignment.model';
import { AssignmentResponseInterface } from '@interfaces/assignment.interface';
import { Purchase } from '@models/purchase.model';
import { PurchaseResponseInterface } from '@interfaces/purchase.interface';

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

        return res.status(status.OK).json(<PreferenceResponseInterface>{
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

export const updateAssignment = async (req: Request, res: Response) => {
    try {
        const [registration, assignment]: [Registration, Assignment] = await Promise.all([
            Registration.findOne({
                where: {
                    id: req.params.registrationId,
                    scout_id: req.params.scoutId
                }
            }),
            Assignment.findOne({
                where: {
                    offering_id: req.params.offeringId,
                    registration_id: req.params.registrationId
                }
            })
        ]);

        if (!registration) {
            throw new Error('Registration to update not found');

        }

        if (!assignment) {
            throw new Error('Assignment to update not found');
        }

        await assignment.update(req.body);

        return res.status(status.OK).json(<AssignmentResponseInterface>{
            message: 'Assignment updated successfully',
            assignment: assignment
        });
    } catch (err) {
        return res.status(status.BAD_REQUEST).json(<ErrorResponseInterface>{
            message: 'Error updating assignment',
            error: err
        });
    }
};

export const updatePurchase = async (req: Request, res: Response) => {
    try {
        const [registration, purchase]: [Registration, Purchase] = await Promise.all([
            Registration.findOne({
                where: {
                    id: req.params.registrationId,
                    scout_id: req.params.scoutId
                }
            }),
            Purchase.findOne({
                where: {
                    purchasable_id: req.params.purchasableId,
                    registration_id: req.params.registrationId
                }
            })
        ]);

        if (!registration) {
            throw new Error('Registration to update not found');
        }

        if (!purchase) {
            throw new Error('Purchase to update not found');
        }

        await purchase.update(req.body);

        return res.status(status.OK).json(<PurchaseResponseInterface>{
            message: 'Purchase updated successfully',
            purchase: purchase
        });
    } catch (err) {
        return res.status(status.BAD_REQUEST).json(<ErrorResponseInterface>{
            message: 'Error updating purchase',
            error: 'err'
        });
    }
};
