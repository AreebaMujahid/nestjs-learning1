import { ListingService } from './listing.service';
import { Query, Args, Mutation, Resolver } from '@nestjs/graphql';
import { CategoryResponse } from './dto/category.response';
import { SubCategoryResponse } from './dto/subcategory.response';
import { CreateListinginput } from './dto/create-listing-input.dto';
import { GraphQLUpload, FileUpload } from 'graphql-upload-ts';
import { AuthGuard } from 'src/utilities/guards/auth.guard';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/utilities/decorators/user.decorator';
import type { JwtTokenPayload } from 'src/utilities/types/token-payload';
import { ListingResponse } from './dto/listing-response.dto';

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

  @Mutation(() => String)
  @UseGuards(AuthGuard)
  async createListing(
    @Args('createListingInput') createListinginput: CreateListinginput,
    @Args({ name: 'listingImage', type: () => GraphQLUpload, nullable: true })
    listingImage: Promise<FileUpload> | null,
    @CurrentUser() user: JwtTokenPayload,
  ) {
    return this.listingService.createListing(
      createListinginput,
      listingImage,
      user,
    );
  }

  @Query(() => [ListingResponse])
  @UseGuards(AuthGuard)
  async fetchAllListing(
    @CurrentUser()
    user: JwtTokenPayload,
  ) {
    return this.listingService.fetchAllistings(user);
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  async deleteListing(
    @CurrentUser() user: JwtTokenPayload,
    @Args('id') id: string,
  ) {
    return this.deleteListing(user, id);
  }
}
