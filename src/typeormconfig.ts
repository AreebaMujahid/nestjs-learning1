import { DataSource } from 'typeorm';
import { User } from './modules/user/entity/user.entity';
import { Crew } from './modules/crew/entity/crew.entity';
import * as dotenv from 'dotenv';
dotenv.config();
const isProd = process.env.NODE_ENV === 'production';
export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl:
    process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  synchronize: false,
  logging: false,
  entities: [User, Crew],
  migrations: isProd ? ['./dist/migrations/*.js'] : ['./src/migrations/*.ts'],
  migrationsTableName: 'migrations',
});
