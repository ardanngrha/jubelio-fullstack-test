import pgPromise from 'pg-promise';
import { databaseConfig } from './config.ts';

const pgp = pgPromise({});

// console.log(`Connecting to database: ${config.database} on ${config.host}:${config.port}`);

const db = pgp(databaseConfig);

export { pgp };
export default db;
