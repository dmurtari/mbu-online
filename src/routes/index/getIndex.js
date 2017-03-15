var status = require('http-status-codes');

function getIndex(req, res) {
  res.status(status.OK).send('Welcome to the MBU API');
}

module.exports = getIndex;
