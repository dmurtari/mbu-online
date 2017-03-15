/* eslint no-console: "off" */

var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var passport = require('passport');

var models = require('./models');

var app = express();
var env = process.env.NODE_ENV || 'development';
var port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

if (env === 'development') {
  app.use(logger('dev'));
}

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

// Passport configuration
app.use(passport.initialize());
require('./config/passport')(passport);

app.use('/api', require('./routes/index'));
app.use('/api', require('./routes/users'));
app.use('/api', require('./routes/forgot'));
app.use('/api/events', require('./routes/events'));
app.use('/api/badges', require('./routes/badges'));
app.use('/api/scouts', require('./routes/scouts'));

app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

if (!module.parent) {
  models.sequelize.sync().then(function () {
    app.listen(port, function () {
      console.log('MBU src listening on port', port);
    });
  });
}

module.exports = app;
