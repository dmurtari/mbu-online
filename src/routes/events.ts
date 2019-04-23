import { Router } from 'express';

import { isAuthorized } from '@middleware/isAuthorized';
import { UserRole } from '@app/interfaces/user.interface';
import { createEvent, setCurrentEvent, createOffering, createPurchasable } from '@routes/events/postEvents';
import { getCurrentEvent, getEvent, getPurchasables } from '@routes/events/getEvents';
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
// router.get('/:eventId/badges/:badgeId/limits', isAuthorized(['admin', 'teacher']), getEvents.classSize);

// // Routes for Purchasable CRUD
eventRoutes.post('/:id/purchasables', isAuthorized([UserRole.ADMIN]), createPurchasable);
eventRoutes.get('/:id/purchasables', getPurchasables);
// router.get('/:id/registrations', isAuthorized(['teacher']), getEvents.getRegistrations);
eventRoutes.put('/:eventId/purchasables/:purchasableId', isAuthorized([UserRole.ADMIN]), updatePurchasable);
eventRoutes.delete('/:eventId/purchasables/:purchasableId', isAuthorized([UserRole.ADMIN]), deletePurchasable);

// // Event income
// router.get('/:id/potentialIncome', isAuthorized(['admin']), getEvents.getPotentialIncome);
// router.get('/:id/income', isAuthorized(['admin']), getEvents.getIncome);

// router.get('/:id/stats', isAuthorized(['admin', 'teacher', 'coordinator']), getEvents.getStats);
// router.get('/:id/offerings/assignees', isAuthorized(['admin', 'teacher']), getEvents.getAssignees);

// module.exports = router;
