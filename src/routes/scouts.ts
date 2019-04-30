// tslint:disable: max-line-length

import { Router } from 'express';

import { isAuthorized } from '@middleware/isAuthorized';
import { isOwner } from '@middleware/isOwner';
import { UserRole } from '@interfaces/user.interface';

import { createRegistration, createPreference, createAssignment, createPurchase } from '@routes/scouts/postScouts';
import { getRegistrations, getPreferences, getAssignments, getPurchases, getAll, getScout } from '@routes/scouts/getScouts';
import { deleteRegistration, deletePreference, deleteAssignment, deletePurchase } from '@routes/scouts/deleteScouts';
import { updatePreference, updateAssignment, updatePurchase } from '@routes/scouts/updateScouts';

export const scoutRoutes = Router();

scoutRoutes.param('scoutId', isOwner);

scoutRoutes.get('/', isAuthorized([UserRole.TEACHER]), getAll);
scoutRoutes.get('/:scoutId', isAuthorized([UserRole.TEACHER, UserRole.COORDINATOR]), getScout);

// // Registration
scoutRoutes.post('/:scoutId/registrations', isAuthorized([UserRole.TEACHER, UserRole.COORDINATOR]), createRegistration);
scoutRoutes.get('/:scoutId/registrations', isAuthorized([UserRole.TEACHER, UserRole.COORDINATOR]), getRegistrations);
scoutRoutes.delete('/:scoutId/registrations/:eventId', isAuthorized([UserRole.TEACHER, UserRole.COORDINATOR]), deleteRegistration);

// // Preferences
scoutRoutes.post('/:scoutId/registrations/:registrationId/preferences', isAuthorized([UserRole.TEACHER, UserRole.COORDINATOR]), createPreference);
scoutRoutes.get('/:scoutId/registrations/:registrationId/preferences', isAuthorized([UserRole.TEACHER, UserRole.COORDINATOR]), getPreferences);
scoutRoutes.put('/:scoutId/registrations/:registrationId/preferences/:offeringId', isAuthorized([UserRole.TEACHER, UserRole.COORDINATOR]), updatePreference);
scoutRoutes.delete('/:scoutId/registrations/:registrationId/preferences/:offeringId', isAuthorized([UserRole.TEACHER, UserRole.COORDINATOR]), deletePreference);

// // Assignments
scoutRoutes.post('/:scoutId/registrations/:registrationId/assignments', isAuthorized([UserRole.TEACHER]), createAssignment);
scoutRoutes.get('/:scoutId/registrations/:registrationId/assignments', isAuthorized([UserRole.TEACHER]), getAssignments);
scoutRoutes.put('/:scoutId/registrations/:registrationId/assignments/:offeringId', isAuthorized([UserRole.TEACHER]), updateAssignment);
scoutRoutes.delete('/:scoutId/registrations/:registrationId/assignments/:offeringId', isAuthorized([UserRole.TEACHER]), deleteAssignment);

// // Purchases
scoutRoutes.post('/:scoutId/registrations/:registrationId/purchases', isAuthorized([UserRole.COORDINATOR]), createPurchase);
scoutRoutes.get('/:scoutId/registrations/:registrationId/purchases', isAuthorized([UserRole.TEACHER, UserRole.COORDINATOR]), getPurchases);
scoutRoutes.put('/:scoutId/registrations/:registrationId/purchases/:purchasableId', isAuthorized([UserRole.COORDINATOR]), updatePurchase);
scoutRoutes.delete('/:scoutId/registrations/:registrationId/purchases/:purchasableId', isAuthorized([UserRole.COORDINATOR]), deletePurchase);

// // Payments
// router.get('/:scoutId/registrations/:registrationId/projectedCost', isAuthorized(['teacher', 'coordinator']), getScouts.getProjectedCost);
// router.get('/:scoutId/registrations/:registrationId/cost', isAuthorized(['teacher', 'coordinator']), getScouts.getActualCost);
