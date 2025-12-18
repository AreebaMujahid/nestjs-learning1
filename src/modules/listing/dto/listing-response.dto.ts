// src/modules/listing/dto/listing-response.dto.ts
import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { ServiceType } from 'src/utilities/enums/service-type';
import { ListingImage } from '../entities/listing-images.entity';
import { Category } from '../entities/category.entity';
import { SubCategory } from '../entities/subcategory.entity';
import { Package } from '../entities/package.entity';

@ObjectType()
export class CategoryOutput {
  @Field(() => ID)
  id: number;

  @Field()
  name: string;
}
@ObjectType()
export class SubCategoryOutput {
  @Field(() => ID)
  id: number;

  @Field()
  name: string;
}
@ObjectType()
export class PackageOutput {
  @Field(() => ID)
  id: number;

  @Field()
  name: string;
}
@ObjectType()
export class LocationCoordinatesOutput {
  @Field(() => Float, { nullable: true })
  lat: number;

  @Field(() => Float, { nullable: true })
  lng: number;
}

@ObjectType()
export class ListingImageOutput {
  @Field(() => ID, { nullable: true })
  id: number;

  @Field({ nullable: true })
  url: string;
}
@ObjectType()
export class ListingResponse {
  @Field(() => ID)
  id: number;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field(() => ServiceType)
  serviceType: ServiceType;

  @Field({ nullable: true })
  commercialPrice?: number;

  @Field(() => [ListingImageOutput], { nullable: true })
  images: ListingImageOutput[];

  @Field(() => CategoryOutput)
  category: CategoryOutput;

  @Field(() => SubCategoryOutput)
  subCategory: SubCategoryOutput;

  @Field(() => PackageOutput, { nullable: true })
  package?: PackageOutput;

  @Field(() => LocationCoordinatesOutput, { nullable: true })
  locationCoordinates?: LocationCoordinatesOutput;

  @Field()
  contactNo: string;

  @Field()
  country: string;

  @Field()
  address: string;
}
