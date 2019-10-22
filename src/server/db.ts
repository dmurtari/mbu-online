import { Sequelize } from 'sequelize-typescript';

const env = process.env.NODE_ENV || 'development';
const localDbUrl = env === 'development' ?
    'postgres://mbu:mbu@localhost/mbu' :
    'postgres://mbu:mbu@localhost/mbutest';

const dbUrl = process.env.DATABASE_URL ? process.env.DATABASE_URL : localDbUrl;

export const sequelize: Sequelize = new Sequelize(dbUrl, {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: !!process.env.LOGGING,
    models: [`${__dirname}/models/**/*.model*`],
    modelMatch: (filename: string, member: string) => {
        return filename.substring(0, filename.indexOf('.model')).toLowerCase() === member.toLowerCase();
    }
});

sequelize.authenticate()
    .catch((err) => {
        console.error('Failed to connect to database', err);
    });
