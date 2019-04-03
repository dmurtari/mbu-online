import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';

const env = process.env.NODE_ENV || 'development';
const localDbUrl = env === 'development' ?
    'postgres://mbu:mbu@localhost/mbu' :
    'postgres://mbu:mbu@localhost/mbutest';

const dbUrl = process.env.DATABASE_URL ? process.env.DATABASE_URL : localDbUrl;

export const sequelize = new Sequelize(dbUrl, {
    dialect: 'postgres',
    protocol: 'postgres',
    operatorsAliases: Op,
    logging: env === 'development',
    models: [__dirname + '/models']
});

sequelize.authenticate()
    .then(() => {
        console.log('Successfully connected to database');
    })
    .catch((err) => {
        console.error('Failed to connect to database', err);
    });
