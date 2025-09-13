import pgPromise from 'pg-promise';
import dotenv from 'dotenv';
dotenv.config();

const pgp = pgPromise({});

export const connection = {
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432'),
  database: process.env.PGDATABASE || 'jubelio',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'password',
};

export const db = pgp(connection);

db.connect()
  .then((obj) => {
    obj.done(); // success, release the connection;
    console.log('Connected to the database successfully.');
  })
  .catch((error) => {
    console.error('Error connecting to the database:', error);
    process.exit(1);
  });

export default db;
