import { ObjectType } from '@nestjs/graphql';
import { Field } from '@nestjs/graphql';

@ObjectType()
export class forgotPasswordOtpResponse {
  @Field()
  otp: string;
}

@ObjectType()
export class forgotPasswordOtpVerifyResponse {
  @Field()
  resetToken: string;
}
