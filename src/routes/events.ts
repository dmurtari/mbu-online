import { Router } from 'express';

import { isAuthorized } from '@middleware/isAuthorized';
import { UserRole } from '@app/interfaces/user.interface';
import { createEvent, setCurrentEvent, createOffering } from '@routes/events/postEvents';
import { getCurrentEvent, getEvent } from '@routes/events/getEvents';
import { deleteEvent } from '@routes/events/deleteEvents';
import { updateEvent } from '@routes/events/updateEvents';

export const eventRoutes = Router();


eventRoutes.post('/', isAuthorized([UserRole.ADMIN]), createEvent);
eventRoutes.get('/', getEvent);
eventRoutes.delete('/:id', isAuthorized([UserRole.ADMIN]), deleteEvent);
eventRoutes.put('/:id', isAuthorized([UserRole.ADMIN]), updateEvent);

eventRoutes.post('/current', isAuthorized([UserRole.ADMIN]), setCurrentEvent);
eventRoutes.get('/current', getCurrentEvent);

// // Routes for Event CRUD

// // Routes for Current Event

// // Routes for Event/Badge association CRUD
eventRoutes.post('/:id/badges', isAuthorized([UserRole.ADMIN]), createOffering);
// router.put('/:eventId/badges/:badgeId', isAuthorized(['admin']), updateEvents.updateOffering);
// router.delete('/:eventId/badges/:badgeId', isAuthorized(['admin']), deleteEvents.deleteOffering);
// router.get('/:eventId/badges/:badgeId/limits', isAuthorized(['admin', 'teacher']), getEvents.classSize);

// // Routes for Purchasable CRUD
// router.post('/:id/purchasables', isAuthorized(['admin']), postEvents.createPurchasable);
// router.get('/:id/purchasables', getEvents.getPurchasables);
// router.get('/:id/registrations', isAuthorized(['teacher']), getEvents.getRegistrations);
// router.put('/:eventId/purchasables/:purchasableId', isAuthorized(['admin']), updateEvents.updatePurchasable);
// router.delete('/:eventId/purchasables/:purchasableId', isAuthorized(['admin']), deleteEvents.deletePurchasable);

// // Event income
// router.get('/:id/potentialIncome', isAuthorized(['admin']), getEvents.getPotentialIncome);
// router.get('/:id/income', isAuthorized(['admin']), getEvents.getIncome);

// router.get('/:id/stats', isAuthorized(['admin', 'teacher', 'coordinator']), getEvents.getStats);
// router.get('/:id/offerings/assignees', isAuthorized(['admin', 'teacher']), getEvents.getAssignees);

// module.exports = router;
