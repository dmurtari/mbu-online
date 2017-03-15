var express = require('express');
var postBadges = require('./badges/postBadges');
var getBadges = require('./badges/getBadges');
var deleteBadges = require('./badges/deleteBadges');
var updateBadges = require('./badges/updateBadges');

var isAuthorized = require('../middleware/auth');

var router = express.Router();

router.post('/', isAuthorized(['teacher']), postBadges.create);
router.get('/', getBadges.get);
router.delete('/:id', isAuthorized(['teacher']), deleteBadges.delete);
router.put('/:id', isAuthorized(['teacher']), updateBadges.update);

module.exports = router;
