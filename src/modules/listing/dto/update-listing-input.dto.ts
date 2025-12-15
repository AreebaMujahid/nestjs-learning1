import { InputType, Field, Int } from '@nestjs/graphql';
@InputType()
export class UpdateListingInput {
  @Field(() => Int)
  listingId: number;

  @Field()
  isActive: boolean;
}
