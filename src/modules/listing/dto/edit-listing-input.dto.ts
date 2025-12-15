import { InputType, Field, ID, Float, registerEnumType } from '@nestjs/graphql';
import { ServiceType } from 'src/utilities/enums/service-type';
import { Upload, FileUpload } from 'graphql-upload-ts';

registerEnumType(ServiceType, {
  name: 'ServiceType', // this name will be used in the GraphQL schema
  description: 'Type of service: personal or commercial',
});

@InputType()
export class LocationCoordinatesInput {
  @Field(() => Float)
  lat: number;

  @Field(() => Float)
  lng: number;
}

@InputType()
export class ListingImageInput {
  @Field(() => ID, { nullable: true })
  id?: number; // existing image id

  @Field()
  url: string; // url of the image (new or existing)
}

@InputType()
export class EditListingInput {
  @Field(() => ID)
  id: number;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => ServiceType, { nullable: true })
  serviceType?: ServiceType;

  @Field({ nullable: true })
  commercialPrice?: number;

  @Field({ nullable: true })
  categoryId?: string;

  @Field({ nullable: true })
  subcategoryId?: string;

  @Field({ nullable: true })
  packageType?: string;

  @Field({ nullable: true })
  startTime?: string;

  @Field({ nullable: true })
  endTime?: string;

  @Field({ nullable: true })
  contactNo?: string;

  @Field({ nullable: true })
  country?: string;

  @Field({ nullable: true })
  address?: string;

  @Field(() => LocationCoordinatesInput, { nullable: true })
  locationCoordinates?: LocationCoordinatesInput;

  @Field(() => [ListingImageInput], { nullable: true })
  existingImages?: ListingImageInput[]; // {id, url} for existing
}
