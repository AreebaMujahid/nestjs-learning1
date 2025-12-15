import { InputType, Field, ID } from '@nestjs/graphql';
@InputType()
export class UpgradeListingPackageInput {
  @Field(() => ID)
  listingId: number;

  @Field(() => ID)
  targetedPackageId: number;
}
