import { DataSource } from 'typeorm';
import { User } from './modules/user/entity/user.entity';
import { Crew } from './modules/crew/entity/crew.entity';
import * as dotenv from 'dotenv';
import { Category } from './modules/listing/entities/category.entity';
import { SubCategory } from './modules/listing/entities/subcategory.entity';
import { Listing } from './modules/listing/entities/listing.entity';
dotenv.config();
const isProd = process.env.NODE_ENV === 'production';
export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: isProd
    ? {
        rejectUnauthorized: false,
      }
    : false,
  synchronize: false,
  logging: false,
  entities: [User, Crew, Category, SubCategory, Listing],
  migrations: isProd ? ['./dist/migrations/*.js'] : ['./src/migrations/*.ts'],
  migrationsTableName: 'migrations',
});
