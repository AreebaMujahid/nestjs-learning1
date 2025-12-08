import { ObjectType } from '@nestjs/graphql';
import { Field } from '@nestjs/graphql';

@ObjectType()
export class SubCategoryResponse {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;
}
