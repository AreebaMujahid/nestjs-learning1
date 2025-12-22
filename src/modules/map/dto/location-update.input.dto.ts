import { InputType, Field, Float } from '@nestjs/graphql';
@InputType()
export class LocationUpdateInputDto {
  @Field(() => Float)
  longitude: number;

  @Field(() => Float)
  latitude: number;
}
