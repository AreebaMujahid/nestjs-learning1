import { InputType, Field } from '@nestjs/graphql';
import { Float } from '@nestjs/graphql';
import { ServiceType } from 'src/utilities/enums/service-type';

@InputType()
export class LocationCoordinateInput {
  @Field(() => Float)
  lat: number;

  @Field(() => Float)
  lng: number;
}

@InputType()
export class CreateListinginput {
  @Field()
  serviceType: ServiceType;

  @Field({ nullable: true })
  commercialPrice?: number;

  @Field()
  categoryId: string;

  @Field()
  subcategoryId: string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  startTime: Date;

  @Field()
  endTime: Date;

  @Field()
  contactNo: string;

  @Field()
  country: string;

  @Field()
  address: string;

  @Field(() => LocationCoordinateInput)
  locationCoordinates: LocationCoordinateInput;

  @Field()
  packageType: string;
}
