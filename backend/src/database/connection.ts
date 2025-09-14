import pgPromise from 'pg-promise';
import { getCurrentDatabaseConfig } from './config.ts';

const pgp = pgPromise({});
const config = getCurrentDatabaseConfig();

// console.log(`Connecting to database: ${config.database} on ${config.host}:${config.port}`);

const db = pgp(config);

export { pgp };
export default db;
