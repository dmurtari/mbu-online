var express = require('express');

var isAuthorized = require('../middleware/auth');
var isOwner = require('../middleware/owner');
var postScouts = require('./scouts/postScouts');
var getScouts = require('./scouts/getScouts');
var updateScouts = require('./scouts/updateScouts');
var deleteScouts = require('./scouts/deleteScouts');

var router = express.Router();

router.param('scoutId', isOwner);

router.get('/', isAuthorized(['admin', 'teacher']), getScouts.getAll);
router.get('/:scoutId', isAuthorized(['admin', 'teacher', 'coordinator']), getScouts.getScout);

// Registration
router.post('/:scoutId/registrations', isAuthorized(['teacher', 'coordinator']), postScouts.createRegistration);
router.get('/:scoutId/registrations', isAuthorized(['teacher', 'coordinator']), getScouts.getRegistrations);
router.delete('/:scoutId/registrations/:eventId', isAuthorized(['teacher', 'coordinator']), deleteScouts.deleteRegistration);

// Preferences
router.post('/:scoutId/registrations/:registrationId/preferences', isAuthorized(['teacher', 'coordinator']), postScouts.createPreference);
router.get('/:scoutId/registrations/:registrationId/preferences', isAuthorized(['teacher', 'coordinator']), getScouts.getPreferences);
router.put('/:scoutId/registrations/:registrationId/preferences/:offeringId', isAuthorized(['teacher', 'coordinator']), updateScouts.updatePreference);
router.delete('/:scoutId/registrations/:registrationId/preferences/:offeringId', isAuthorized(['teacher', 'coordinator']), deleteScouts.deletePreference);

// Assignments
router.post('/:scoutId/registrations/:registrationId/assignments', isAuthorized(['teacher']), postScouts.createAssignment);
router.get('/:scoutId/registrations/:registrationId/assignments', isAuthorized(['teacher']), getScouts.getAssignments);
router.put('/:scoutId/registrations/:registrationId/assignments/:offeringId', isAuthorized(['teacher']), updateScouts.updateAssignment);
router.delete('/:scoutId/registrations/:registrationId/assignments/:offeringId', isAuthorized(['teacher']), deleteScouts.deleteAssignment);

// Purchases
router.post('/:scoutId/registrations/:registrationId/purchases', isAuthorized(['coordinator']), postScouts.createPurchase);
router.get('/:scoutId/registrations/:registrationId/purchases', isAuthorized(['teacher', 'coordinator']), getScouts.getPurchases);
router.put('/:scoutId/registrations/:registrationId/purchases/:purchasableId', isAuthorized(['coordinator']), updateScouts.updatePurchase);
router.delete('/:scoutId/registrations/:registrationId/purchases/:purchasableId', isAuthorized(['coordinator']), deleteScouts.deletePurchase);

// Payments
router.get('/:scoutId/registrations/:registrationId/projectedCost', isAuthorized(['teacher', 'coordinator']), getScouts.getProjectedCost);
router.get('/:scoutId/registrations/:registrationId/cost', isAuthorized(['teacher', 'coordinator']), getScouts.getActualCost);

module.exports = router;
