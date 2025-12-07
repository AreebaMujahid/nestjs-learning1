import { Resolver } from '@nestjs/graphql';
import { ListingService } from './listing.service';
import { Query } from '@nestjs/graphql';

@Resolver()
export class ListingResolver {
  constructor(private readonly listingService: ListingService) {}

  @Query()
  getListingCategories() {
    return this.getListingCategories();
  }
}
