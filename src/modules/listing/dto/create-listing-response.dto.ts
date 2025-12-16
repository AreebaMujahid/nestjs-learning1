import { ObjectType, Field, createUnionType } from '@nestjs/graphql';

@ObjectType()
export class StripeSession {
  @Field()
  sessionId: string;
}

@ObjectType()
export class ListingCreated {
  @Field()
  success: boolean;
}

export const CreateListingResult = createUnionType({
  name: 'CreateListingResult',
  types: () => [ListingCreated, StripeSession] as const,
  resolveType(value) {
    if ('success' in value) {
      return ListingCreated;
    }
    if ('sessionId' in value) {
      return StripeSession;
    }
    return null;
  },
});
