import { Router, RequestHandler } from 'express';
import passport from 'passport';

import { signup, authenticate, addScout } from '@routes/users/postUsers';
import { byEmail, fromToken, byId, getEventRegistrations, getScoutRegistrations } from '@routes/users/getUsers';
import { updateProfile, updateScout } from '@routes/users/putUsers';
import { deleteUser, deleteScout } from '@routes/users/deleteUsers';
import { currentUser } from '@middleware/currentUser';
import { canUpdateRole } from '@middleware/canUpdateRole';
import { isAuthorized } from '@middleware/isAuthorized';
import { UserRole } from '@interfaces/user.interface';
import { isOwner } from '@middleware/isOwner';

export const userRoutes = Router();

const scoutMiddleware: RequestHandler[] = [currentUser([UserRole.TEACHER]), isAuthorized([UserRole.TEACHER, UserRole.COORDINATOR])];

userRoutes.param('scoutId', isOwner);

userRoutes.post('/signup', signup);
userRoutes.post('/authenticate', authenticate);

userRoutes.get('/profile', passport.authenticate('jwt', { session: false }), fromToken);
userRoutes.get('/users/:userId?', currentUser([UserRole.TEACHER]), byId());
userRoutes.put('/users/:userId', [currentUser([UserRole.TEACHER]), canUpdateRole], updateProfile);
userRoutes.delete('/users/:userId', currentUser(), deleteUser);
userRoutes.get('/users/exists/:email', byEmail);

// // Scouts
userRoutes.get('/users/:userId/scouts', scoutMiddleware, byId(true));
userRoutes.get('/users/:userId/scouts/registrations', scoutMiddleware, getScoutRegistrations);
userRoutes.put('/users/:userId/scouts/:scoutId', scoutMiddleware, updateScout);
userRoutes.post('/users/:userId/scouts', scoutMiddleware, addScout);
userRoutes.delete('/users/:userId/scouts/:scoutId', scoutMiddleware, deleteScout);

// // Registrations
userRoutes.get('/users/:userId/events/:eventId/registrations', scoutMiddleware, getEventRegistrations);

// // Payments
// router.get('/users/:userId/events/:eventId/projectedCost', isCurrentUser(), getUsers.getProjectedCost);
// router.get('/users/:userId/events/:eventId/cost', isCurrentUser(), getUsers.getActualCost);

// module.exports = router;
