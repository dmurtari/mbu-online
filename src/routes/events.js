var express = require('express');
var postEvents = require('./events/postEvents');
var getEvents = require('./events/getEvents');
var deleteEvents = require('./events/deleteEvents');
var updateEvents = require('./events/updateEvents');

var isAuthorized = require('../middleware/auth');

var router = express.Router();

// Routes for Event CRUD
router.post('/', isAuthorized(['admin']), postEvents.create);
router.get('/', getEvents.get);
router.delete('/:id', isAuthorized(['admin']), deleteEvents.delete);
router.put('/:id', isAuthorized(['admin']), updateEvents.update);

// Routes for Current Event
router.post('/current', isAuthorized(['admin']), postEvents.setCurrentEvent);
router.get('/current', getEvents.getCurrentEvent);

// Routes for Event/Badge association CRUD
router.post('/:id/badges', isAuthorized(['admin']), postEvents.createOffering);
router.put('/:eventId/badges/:badgeId', isAuthorized(['admin']), updateEvents.updateOffering);
router.delete('/:eventId/badges/:badgeId', isAuthorized(['admin']), deleteEvents.deleteOffering);

// Routes for Purchasable CRUD
router.post('/:id/purchasables', isAuthorized(['admin']), postEvents.createPurchasable);
router.get('/:id/purchasables', getEvents.getPurchasables);
router.get('/:id/registrations', isAuthorized(['teacher']), getEvents.getRegistrations);
router.put('/:eventId/purchasables/:purchasableId', isAuthorized(['admin']), updateEvents.updatePurchasable);
router.delete('/:eventId/purchasables/:purchasableId', isAuthorized(['admin']), deleteEvents.deletePurchasable);

// Event income
router.get('/:id/potentialIncome', isAuthorized(['admin']), getEvents.getPotentialIncome);
router.get('/:id/income', isAuthorized(['admin']), getEvents.getIncome);

router.get('/:id/offerings/assignees', isAuthorized(['admin', 'teacher']), getEvents.getAssignees);

module.exports = router;
