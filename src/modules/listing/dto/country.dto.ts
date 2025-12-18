import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class CountryDto {
  @Field()
  code: string;

  @Field()
  name: string;
}
