/* eslint no-console: "off" */

var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var passport = require('passport');
var path = require('path');
var compression = require('compression');
var helmet = require('helmet');

var models = require('./models');

var app = express();
var history = require('connect-history-api-fallback');
var env = process.env.NODE_ENV || 'development';
var port = process.env.PORT || 3000;
var morganFormat = ':method :url :status :res[content-length] - :response-time ms';

app.use(history({
  // verbose: true
}));

app.use(compression());
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

if (env === 'development') {
  app.use(morgan(morganFormat));
  app.use(function (req, res, next) {
    setTimeout(function () {
      next();
    }, 500);
  });
}

if (env === 'production') {
  app.use(morgan(morganFormat));
  app.use(express.static(path.join(__dirname, '../node_modules/mbu-frontend/dist')));
}

app.use(function (req, res, next) {
  if (env === 'development') {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
  }

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
