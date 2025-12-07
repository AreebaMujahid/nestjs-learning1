import { Module } from '@nestjs/common';
import { ListingService } from './listing.service';
import { ListingResolver } from './listing.resolver';

@Module({
  providers: [ListingService, ListingResolver],
})
export class ListingModule {}
