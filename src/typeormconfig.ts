import { DataSource } from 'typeorm';
import { User } from './modules/user/entity/user.entity';
import { Crew } from './modules/crew/entity/crew.entity';
import * as dotenv from 'dotenv';
import { Category } from './modules/listing/entities/category.entity';
import { SubCategory } from './modules/listing/entities/subcategory.entity';
import { Listing } from './modules/listing/entities/listing.entity';
import { Package } from './modules/listing/entities/package.entity';
import { FeaturePayment } from './modules/listing/entities/feature-payment.entity';
import { ListingImage } from './modules/listing/entities/listing-images.entity';
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
  entities: [
    User,
    Crew,
    Category,
    SubCategory,
    Listing,
    Package,
    FeaturePayment,
    ListingImage,
  ],
  migrations: isProd ? ['./dist/migrations/*.js'] : ['./src/migrations/*.ts'],
  migrationsTableName: 'migrations',
});
