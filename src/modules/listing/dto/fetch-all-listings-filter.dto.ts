import { ObjectType, Field, InputType } from '@nestjs/graphql';

@InputType()
export class FetchAllListingsInput {
  @Field()
  isActive: boolean;
}
