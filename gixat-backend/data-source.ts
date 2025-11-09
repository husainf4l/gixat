import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// Load environment variables
config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || '149.200.251.12',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'husain',
  password: process.env.DB_PASSWORD || 'tt55oo77',
  database: process.env.DB_DATABASE || 'gixat',
  entities: [__dirname + '/src/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/src/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations',
  synchronize: false, // Never use synchronize in production
  logging: ['error', 'warn', 'migration'],
});