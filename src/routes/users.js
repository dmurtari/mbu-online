var express = require('express');
var passport = require('passport');

var postUsers = require('./users/postUsers');
var getUsers = require('./users/getUsers');
var putUsers = require('./users/putUsers');
var deleteUsers = require('./users/deleteUsers');

var isAuthorized = require('../middleware/auth');
var isOwner = require('../middleware/owner');
var isCurrentUser = require('../middleware/currentUser');
var canUpdateRole = require('../middleware/userUpdatePermissions');

var router = express.Router();

router.param('scoutId', isOwner);

router.post('/signup', postUsers.signup);
router.post('/authenticate', postUsers.authenticate);
router.get('/profile', passport.authenticate('jwt', { session: false }), postUsers.protected);
router.get('/users/:userId?', isCurrentUser(['teacher']), getUsers.get(false));
router.put('/users/:userId', [isCurrentUser(['teacher']), canUpdateRole], putUsers.updateProfile);
router.delete('/users/:userId', isCurrentUser(), deleteUsers.deleteUser);

// Scouts
var scoutMiddleware = [isCurrentUser(['teacher']), isAuthorized(['teacher', 'coordinator'])];
router.get('/users/:userId/scouts', scoutMiddleware, getUsers.get(true));
router.get('/users/:userId/scouts/registrations', scoutMiddleware, getUsers.getScoutRegistrations);
router.put('/users/:userId/scouts/:scoutId', scoutMiddleware, putUsers.updateScout);
router.post('/users/:userId/scouts', scoutMiddleware, postUsers.createScout);
router.delete('/users/:userId/scouts/:scoutId', scoutMiddleware, deleteUsers.deleteScout);

// Registrations
router.get('/users/:userId/events/:eventId/registrations', scoutMiddleware, getUsers.getEventRegistrations);

// Payments
router.get('/users/:userId/events/:eventId/projectedCost', isCurrentUser(), getUsers.getProjectedCost);
router.get('/users/:userId/events/:eventId/cost', isCurrentUser(), getUsers.getActualCost);

module.exports = router;
