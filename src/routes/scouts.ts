// tslint:disable: max-line-length

import { Router } from 'express';

import { isAuthorized } from '@middleware/isAuthorized';
import { isOwner } from '@middleware/isOwner';
import { UserRole } from '@interfaces/user.interface';

import { createRegistration, createPreference, createAssignment } from '@routes/scouts/postScouts';
import { getRegistrations, getPreferences, getAssignments } from '@routes/scouts/getScouts';
import { deleteRegistration, deletePreference, deleteAssignment } from '@routes/scouts/deleteScouts';
import { updatePreference, updateAssignment } from '@routes/scouts/updateScouts';

export const scoutRoutes = Router();

scoutRoutes.param('scoutId', isOwner);

// router.get('/', isAuthorized(['admin', 'teacher']), getScouts.getAll);
// router.get('/:scoutId', isAuthorized(['admin', 'teacher', 'coordinator']), getScouts.getScout);

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
// router.post('/:scoutId/registrations/:registrationId/purchases', isAuthorized(['coordinator']), postScouts.createPurchase);
// router.get('/:scoutId/registrations/:registrationId/purchases', isAuthorized(['teacher', 'coordinator']), getScouts.getPurchases);
// router.put('/:scoutId/registrations/:registrationId/purchases/:purchasableId', isAuthorized(['coordinator']), updateScouts.updatePurchase);
// router.delete('/:scoutId/registrations/:registrationId/purchases/:purchasableId', isAuthorized(['coordinator']), deleteScouts.deletePurchase);

// // Payments
// router.get('/:scoutId/registrations/:registrationId/projectedCost', isAuthorized(['teacher', 'coordinator']), getScouts.getProjectedCost);
// router.get('/:scoutId/registrations/:registrationId/cost', isAuthorized(['teacher', 'coordinator']), getScouts.getActualCost);
