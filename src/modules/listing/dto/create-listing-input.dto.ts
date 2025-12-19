import { InputType, Field } from '@nestjs/graphql';
import { Float } from '@nestjs/graphql';
import { ServiceType } from 'src/utilities/enums/service-type';
import { IsString, Length } from 'class-validator';

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
  @IsString()
  @Length(2, 20, { message: 'Name must be between 2 and 20 characters long' })
  name: string;

  @Field()
  @IsString()
  @Length(10, 500, {
    message: 'Description must be between 10 and 500 characters long.',
  })
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

  @Field({ nullable: true })
  packageType?: string;

  @Field()
  priceId: string;
}
