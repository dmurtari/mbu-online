var express = require('express');
var getIndex = require('./index/getIndex');

var router = express.Router();

router.get('/', getIndex);

module.exports = router;
