import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { DatabaseConfiguration } from 'src/configs/env-config/configurations/database.configuration';
import { User } from 'src/modules/user/entity/user.entity';
import { Crew } from 'src/modules/crew/entity/crew.entity';
import { Injectable } from '@nestjs/common';
import { Category } from 'src/modules/listing/entities/category.entity';
import { SubCategory } from 'src/modules/listing/entities/subcategory.entity';
import { Listing } from 'src/modules/listing/entities/listing.entity';
import { ConfigService } from '@nestjs/config';
import { Package } from 'src/modules/listing/entities/package.entity';
import { FeaturePayment } from 'src/modules/listing/entities/feature-payment.entity';
import { ListingImage } from 'src/modules/listing/entities/listing-images.entity';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(
    private readonly databaseConfig: DatabaseConfiguration,
    private readonly configService: ConfigService,
  ) {}

  createTypeOrmOptions(): Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions {
    return {
      type: 'postgres',
      url: this.configService.getOrThrow<string>('DATABASE_URL'),
      synchronize: this.databaseConfig.sync,
      ssl: this.databaseConfig.ssl,
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
      //logging: true,
      migrations: [],
      extra: {},
      migrationsTableName: 'migrations',
    };
  }
}
