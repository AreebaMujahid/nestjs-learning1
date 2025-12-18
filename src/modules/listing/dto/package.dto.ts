import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class PackageDTO {
  @Field(() => ID)
  id: number;

  @Field()
  name: string;

  @Field({ nullable: true })
  stripePriceId?: string;

  @Field()
  price: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
