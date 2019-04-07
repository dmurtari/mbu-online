import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';

const env = process.env.NODE_ENV || 'development';
const localDbUrl = env === 'development' ?
    'postgres://mbu:mbu@localhost/mbu' :
    'postgres://mbu:mbu@localhost/mbutest';

const dbUrl = process.env.DATABASE_URL ? process.env.DATABASE_URL : localDbUrl;

export const sequelize: Sequelize = new Sequelize(dbUrl, {
    dialect: 'postgres',
    protocol: 'postgres',
    operatorsAliases: Op,
    logging: env !== 'test',
    models: [`${__dirname}/models/**/*.model*`],
    modelMatch: (filename: string, member: string) => filename.substring(0, filename.indexOf('.model')).toLowerCase() === member.toLowerCase()
});

sequelize.authenticate()
    .then(() => {
        console.log('Successfully connected to database');
    })
    .catch((err) => {
        console.error('Failed to connect to database', err);
    });
