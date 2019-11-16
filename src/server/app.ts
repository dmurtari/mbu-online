import 'module-alias/register';
import '@config/passport';

import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import passport from 'passport';
import path from 'path';
import compression from 'compression';
import helmet from 'helmet';
import history from 'connect-history-api-fallback';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

import { sequelize } from './db';
import { indexRoutes } from '@routes/index';
import { userRoutes } from '@routes/users';
import { eventRoutes } from '@routes/events';
import { badgeRoutes } from '@routes/badges';
import { scoutRoutes } from '@routes/scouts';
import { forgotPasswordRoutes } from '@routes/forgot';

const app = express();
const env = process.env.NODE_ENV || 'development';
const port = process.env.PORT || 3000;
const morganFormat = ':method :url :status :res[content-length] - :response-time ms';

app.use(history());

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
    app.use(express.static(path.join(__dirname, '../../client')));
}

app.use((_req: Request, res: Response, next: NextFunction) => {
    if (env === 'development') {
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
});

app.use(passport.initialize());

app.use('/api', indexRoutes);
app.use('/api', userRoutes);
app.use('/api', forgotPasswordRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/scouts', scoutRoutes);

if (env === 'development') {
    const webpackConfig = require('@vue/cli-service/webpack.config.js');
    webpackConfig.entry.app[0] = './src/client/src/main.js';

    const compiler = webpack(webpackConfig);

    app.use(webpackDevMiddleware(compiler, {
        publicPath: webpackConfig.output.publicPath,
    }));
    app.use(webpackHotMiddleware(compiler));

    app.get('*', (_req, res) => {
        res.sendFile(path.join(compiler.outputPath, 'index.html'));
    });
}

app.use((_req, res, _next) => {
    res.status(404).send();
});

if (!module.parent) {
    sequelize.sync().then(() => {
        app.listen(port, () => {
            console.log('Listening on port:', port);
        });
    });
}

export default app;
