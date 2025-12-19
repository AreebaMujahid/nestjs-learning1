import { Module } from '@nestjs/common';
import { ListingService } from './listing.service';
import { ListingResolver } from './listing.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { SubCategory } from './entities/subcategory.entity';
import { Package } from './entities/package.entity';
import { SharedModule } from '../shared/shared.module';
import { ConfigModule } from '@nestjs/config';
import { User } from '../user/entity/user.entity';
import { Listing } from './entities/listing.entity';
import { StripeService } from '../stripe/stripe.service';
import { FeaturePayment } from './entities/feature-payment.entity';
import { ListingImage } from './entities/listing-images.entity';
import { FavouriteListing } from './entities/favorourit-listing.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Category,
      SubCategory,
      Package,
      User,
      Listing,
      Package,
      FeaturePayment,
      ListingImage,
      FavouriteListing,
    ]),
    SharedModule,
    ConfigModule,
  ],
  providers: [ListingService, ListingResolver, StripeService],
  exports: [TypeOrmModule],
})
export class ListingModule {}
