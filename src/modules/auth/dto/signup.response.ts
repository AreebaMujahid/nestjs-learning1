import { ObjectType } from '@nestjs/graphql';
import { Field } from '@nestjs/graphql';
@ObjectType()
export class SignUpResponse {
  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;

  @Field()
  otp: string;
}
