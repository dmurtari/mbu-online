import { Router } from 'express';

import { isAuthorized } from '@middleware/isAuthorized';
import { UserRole } from '@interfaces/user.interface';
import { createEvent, setCurrentEvent, createOffering, createPurchasable } from '@routes/events/postEvents';
import {
    getCurrentEvent,
    getEvent,
    getPurchasables,
    getClassSize,
    getRegistrations,
    getAssignees,
    getPotentialIncome,
    getActualIncome,
    getStats,
    getBuyers
} from '@routes/events/getEvents';
import { deleteEvent, deleteOffering, deletePurchasable } from '@routes/events/deleteEvents';
import { updateEvent, updateOffering, updatePurchasable } from '@routes/events/updateEvents';

export const eventRoutes = Router();

eventRoutes.post('/', isAuthorized([UserRole.ADMIN]), createEvent);
eventRoutes.get('/', getEvent);
eventRoutes.delete('/:id', isAuthorized([UserRole.ADMIN]), deleteEvent);
eventRoutes.put('/:id', isAuthorized([UserRole.ADMIN]), updateEvent);

eventRoutes.post('/current', isAuthorized([UserRole.ADMIN]), setCurrentEvent);
eventRoutes.get('/current', getCurrentEvent);

eventRoutes.post('/:id/badges', isAuthorized([UserRole.ADMIN]), createOffering);
eventRoutes.put('/:eventId/badges/:badgeId', isAuthorized([UserRole.ADMIN]), updateOffering);
eventRoutes.delete('/:eventId/badges/:badgeId', isAuthorized([UserRole.ADMIN]), deleteOffering);
eventRoutes.get('/:eventId/badges/:badgeId/limits', isAuthorized([UserRole.ADMIN, UserRole.TEACHER]), getClassSize);

// // Routes for Purchasable CRUD
eventRoutes.post('/:id/purchasables', isAuthorized([UserRole.ADMIN]), createPurchasable);
eventRoutes.get('/:id/purchasables', getPurchasables);
eventRoutes.get('/:id/registrations', isAuthorized([UserRole.TEACHER]), getRegistrations);
eventRoutes.put('/:eventId/purchasables/:purchasableId', isAuthorized([UserRole.ADMIN]), updatePurchasable);
eventRoutes.delete('/:eventId/purchasables/:purchasableId', isAuthorized([UserRole.ADMIN]), deletePurchasable);
eventRoutes.get('/:eventId/purchasables/:purchasableId/buyers', isAuthorized([UserRole.ADMIN, UserRole.TEACHER]), getBuyers);

// // Event income
eventRoutes.get('/:id/potentialIncome', isAuthorized([UserRole.ADMIN]), getPotentialIncome);
eventRoutes.get('/:id/income', isAuthorized([UserRole.ADMIN]), getActualIncome);

eventRoutes.get('/:id/stats', isAuthorized([UserRole.ADMIN, UserRole.COORDINATOR, UserRole.TEACHER]), getStats);
eventRoutes.get('/:id/offerings/assignees', isAuthorized([UserRole.TEACHER]), getAssignees);
