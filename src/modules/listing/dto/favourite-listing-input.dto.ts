import { InputType, Field } from '@nestjs/graphql';
@InputType()
export class FavouritelistingInput {
  @Field()
  listingId: string;

  @Field()
  isFavourite: boolean;
}
