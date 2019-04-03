/* eslint no-console: "off" */

import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import passport from 'passport';
import path from 'path';
import compression from 'compression';
import helmet from 'helmet';
import history from 'connect-history-api-fallback';

const models = require('./models');
const app = express();
const env = process.env.NODE_ENV || 'development';
const port = process.env.PORT || 3000;
const morganFormat = ':method :url :status :res[content-length] - :response-time ms';

app.use(history({
    // verbose: true
}));

app.use(compression());
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

if (env === 'development') {
    app.use(morgan(morganFormat));
    app.use((req, res, next) => {
        setTimeout(() => {
            next();
        }, 500);
    });
}

if (env === 'production') {
    app.use(morgan(morganFormat));
    app.use(express.static(path.join(__dirname, '../node_modules/mbu-frontend/dist')));
}

app.use((_req, res, next) => {
    if (env === 'development') {
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
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

app.use((_req, res, _next) => {
    res.status(404).send();
});

if (!module.parent) {
    models.sequelize.sync().then(() => {
        app.listen(port, () => {
            console.log('Listening on port:', port);
        });
    });
}

export default app;
