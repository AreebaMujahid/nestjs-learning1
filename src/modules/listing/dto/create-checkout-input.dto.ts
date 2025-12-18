import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class CreateCheckoutInput {
  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  serviceType: string;

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

  @Field(() => ID)
  packageId: number;

  @Field(() => ID)
  ownerId: number;
}
