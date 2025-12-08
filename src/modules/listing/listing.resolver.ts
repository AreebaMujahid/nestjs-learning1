import { Resolver } from '@nestjs/graphql';
import { ListingService } from './listing.service';
import { Query, Args } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { CategoryResponse } from './dto/category.response';
import { SubCategoryResponse } from './dto/subcategory.response';

@Resolver()
export class ListingResolver {
  constructor(private readonly listingService: ListingService) {}

  @Query(() => [CategoryResponse])
  async getListingCategories() {
    return this.listingService.getListingCategories();
  }

  @Query(() => [SubCategoryResponse])
  async getSubCategory(@Args('id') id: string) {
    return this.listingService.getSubCategories(id);
  }
}
