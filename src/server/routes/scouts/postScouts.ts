import { Request, Response } from 'express';
import status from 'http-status-codes';

import { Scout } from '@models/scout.model';
import { Registration } from '@models/registration.model';
import { ErrorResponseDto } from '@interfaces/shared.interface';
import { RegistrationInterface, CreateRegistrationResponseDto } from '@interfaces/registration.interface';
import { Event } from '@models/event.model';
import { Preference } from '@models/preference.model';
import { CreatePreferenceRequestDto, PreferenceInterface, CreatePreferenceResponseDto } from '@interfaces/preference.interface';
import { Offering } from '@models/offering.model';
import { Assignment } from '@models/assignment.model';
import { AssignmentInterface, CreateAssignmentRequestDto, CreateAssignmentResponseDto } from '@interfaces/assignment.interface';
import { Badge } from '@models/badge.model';
import { Purchasable } from '@models/purchasable.model';
import { CreatePurchaseResponseDto } from '@interfaces/purchase.interface';
import { Purchase } from '@models/purchase.model';

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
        return res.status(status.BAD_REQUEST).json(<ErrorResponseDto>{
            message: 'Registration could not be created',
            error: 'err'
        });
    }
};

export const createPreference = async (req: Request, res: Response) => {
    try {
        const scoutId = req.params.scoutId;
        const registrationId = Number(req.params.registrationId);

        if (Array.isArray(req.body)) {
            await Preference.destroy({
                where: {
                    registration_id: registrationId
                }
            });

            const preferences: PreferenceInterface[] = req.body.map((preference: CreatePreferenceRequestDto) => ({
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
                through: <any>{
                    rank: req.body.rank
                }
            });
        }

        const createdRegistration: Registration = await Registration.findByPk(registrationId, {
            include: [{
                model: Offering,
                as: 'preferences',
                attributes: ['badge_id', ['id', 'offering_id']],
                through: <any>{
                    as: 'details',
                    attributes: ['rank']
                }
            }]
        });

        return res.status(status.CREATED).json(<CreatePreferenceResponseDto>{
            message: 'Preference created',
            registration: createdRegistration
        });
    } catch (err) {
        return res.status(status.BAD_REQUEST).json(<ErrorResponseDto>{
            message: 'Preference could not be created',
            error: 'err'
        });
    }
};

export const createAssignment = async (req: Request, res: Response) => {
    try {
        const registrationId = Number(req.params.registrationId);
        let assignments: AssignmentInterface[];

        if (Array.isArray(req.body)) {
            await Assignment.destroy({
                where: {
                    registration_id: registrationId
                }
            });

            assignments = req.body.map((assignment: CreateAssignmentRequestDto) => ({
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
                through: <any>{
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

        return res.status(status.CREATED).json(<CreateAssignmentResponseDto>{
            message: 'Assignment created successfully',
            registration: createdRegistration
        });
    } catch (err) {
        return res.status(status.BAD_REQUEST).json(<ErrorResponseDto>{
            message: 'Assignment could not be created',
            error: 'err'
        });
    }
};

export const createPurchase = async (req: Request, res: Response) => {
    try {
        const registration: Registration = await Registration.findOne({
            where: {
                id: req.params.registrationId,
                scout_id: req.params.scoutId
            }
        });

        const purchase: Purchase = await Purchase.create({
            quantity: req.body.quantity,
            size: req.body.size,
            purchasable_id: req.body.purchasable,
            registration_id: req.params.registrationId
        });

        const createdRegistration: Registration = await Registration.findByPk(req.params.registrationId, {
            include: [{
                model: Purchasable,
                as: 'purchases',
                through: <any>{
                    as: 'details',
                    attributes: ['size', 'quantity']
                }
            }]
        });

        return res.status(status.CREATED).json(<CreatePurchaseResponseDto>{
            message: 'Purchase created' ,
            registration: createdRegistration
        });
    } catch (err) {
        return res.status(status.BAD_REQUEST).json(<ErrorResponseDto>{
            message: 'Purchase could not be created',
            error: err
        });
    }
};
