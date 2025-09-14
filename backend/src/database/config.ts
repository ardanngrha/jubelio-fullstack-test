import dotenv from 'dotenv';

dotenv.config();

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

export const databaseConfig: DatabaseConfig = {
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432'),
  database: process.env.PGDATABASE || 'jubelio',
  user: process.env.PGUSER || '',
  password: process.env.PGPASSWORD || '',
};

export const testDatabaseConfig: DatabaseConfig = {
  host: process.env.PGHOST_TEST || process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT_TEST || process.env.PGPORT || '5432'),
  database: process.env.PGDATABASE_TEST || 'jubelio_test',
  user: process.env.PGUSER_TEST || process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD_TEST || process.env.PGPASSWORD || 'password',
};

export const getConnectionString = (config: DatabaseConfig): string => {
  return `postgresql://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}`;
};

export const getCurrentDatabaseConfig = (): DatabaseConfig => {
  return databaseConfig;
};
