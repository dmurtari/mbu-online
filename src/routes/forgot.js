var express = require('express');
var router = express.Router();

var postForgot = require('./forgot/postForgot');
var getForgot = require('./forgot/getForgot');

router.post('/forgot', postForgot.forgot);
router.get('/reset/:token', getForgot.reset);
router.post('/reset/', postForgot.reset);

module.exports = router;
