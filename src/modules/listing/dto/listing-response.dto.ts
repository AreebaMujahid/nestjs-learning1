import { ObjectType, Field } from '@nestjs/graphql';
@ObjectType()
export class ListingResponse {
  @Field()
  id: string;

  @Field()
  image: string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  isActive: boolean;

  @Field()
  isArchived: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
