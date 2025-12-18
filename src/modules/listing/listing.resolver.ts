import { ListingService } from './listing.service';
import { Query, Args, Mutation, Resolver, Int } from '@nestjs/graphql';
import { CategoryResponse } from './dto/category.response';
import { SubCategoryResponse } from './dto/subcategory.response';
import { CreateListinginput } from './dto/create-listing-input.dto';
import { GraphQLUpload, FileUpload } from 'graphql-upload-ts';
import { AuthGuard } from 'src/utilities/guards/auth.guard';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/utilities/decorators/user.decorator';
import type { JwtTokenPayload } from 'src/utilities/types/token-payload';
import { ListingResponse } from './dto/listing-response.dto';
import { UpdateListingInput } from './dto/update-listing-input.dto';
import { FetchAllListingsInput } from './dto/fetch-all-listings-filter.dto';
import { PackageDTO } from './dto/package.dto';
import { CountryDto } from './dto/country.dto';
import { EditListingInput } from './dto/edit-listing-input.dto';
import { UpgradeListingPackageInput } from './dto/upgrade-listing-package-input.dto';

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
    @Args({
      name: 'listingImages',
      type: () => [GraphQLUpload],
      nullable: true,
    })
    listingImages: Promise<FileUpload>[] | null,
    @CurrentUser() user: JwtTokenPayload,
  ) {
    return this.listingService.createListing(
      createListinginput,
      listingImages,
      user,
    );
  }

  @Query(() => [ListingResponse])
  @UseGuards(AuthGuard)
  async fetchAllListing(
    @Args('fetchAllListingsInput') fetchAllListingsInput: FetchAllListingsInput,
    @CurrentUser()
    user: JwtTokenPayload,
  ) {
    return this.listingService.fetchAllistings(fetchAllListingsInput, user);
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  async deleteListing(
    @CurrentUser() user: JwtTokenPayload,
    @Args('id') id: string,
  ) {
    return this.listingService.deleteListing(user, id);
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  async updateListingStatus(
    @Args('input') input: UpdateListingInput,
    @CurrentUser() user: JwtTokenPayload,
  ) {
    return this.listingService.updateListingStatus(input, user);
  }

  @Query(() => [PackageDTO])
  @UseGuards(AuthGuard)
  async fetchAllPackages() {
    return this.listingService.fetchAllPackages();
  }

  @Query(() => [CountryDto])
  @UseGuards(AuthGuard)
  async getAllCountries() {
    return this.listingService.getAllCountries();
  }

  @Mutation(() => ListingResponse)
  @UseGuards(AuthGuard)
  async editListing(
    @Args('editListingInput') editListingInput: EditListingInput,
    @Args({ name: 'newImages', type: () => [GraphQLUpload], nullable: true })
    newImages: Promise<FileUpload>[],
    @CurrentUser() user: JwtTokenPayload,
  ) {
    console.log('new images', newImages);
    return this.listingService.editListing(editListingInput, user, newImages);
  }

  //fetch listing by id ka end point , then test edit ka flow
  @Query(() => ListingResponse)
  async getListingById(@Args('id', { type: () => Int }) id: number) {
    return this.listingService.getListingById(id);
  }

  @Mutation(() => String)
  @UseGuards(AuthGuard)
  async updateListingPackageCheckout(
    @Args('input') input: UpgradeListingPackageInput,
    @CurrentUser() user: JwtTokenPayload,
  ) {
    return this.listingService.updateListingPackageCheckout(input, user);
  }
}
