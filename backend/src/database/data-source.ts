import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';

export function databaseOptions(): DataSourceOptions {
  const production = process.env.NODE_ENV === 'production';
  return {
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT ?? 5432),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    ssl:
      process.env.DATABASE_SSL === 'true'
        ? { rejectUnauthorized: false }
        : false,
    entities: [
      __dirname + '/../**/*.entity{.ts,.js}',
      __dirname + '/../community/entities/*{.ts,.js}',
    ],
    migrations: [__dirname + '/migrations/*{.ts,.js}'],
    synchronize: false,
    migrationsRun: process.env.DATABASE_MIGRATIONS_RUN === 'true',
    logging: process.env.DATABASE_LOGGING === 'true',
    extra: {
      max: Number(process.env.DATABASE_POOL_MAX ?? (production ? 20 : 10)),
      min: Number(process.env.DATABASE_POOL_MIN ?? 2),
      idleTimeoutMillis: Number(process.env.DATABASE_IDLE_TIMEOUT_MS ?? 30_000),
      connectionTimeoutMillis: Number(
        process.env.DATABASE_CONNECTION_TIMEOUT_MS ?? 5_000,
      ),
      statement_timeout: Number(
        process.env.DATABASE_STATEMENT_TIMEOUT_MS ?? 10_000,
      ),
      application_name: 'anchor-api',
    },
  };
}
// T: O(1) and S: O(1)

export default new DataSource(databaseOptions());
