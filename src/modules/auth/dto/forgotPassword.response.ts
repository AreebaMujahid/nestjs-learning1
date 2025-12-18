import { ObjectType } from '@nestjs/graphql';
import { Field } from '@nestjs/graphql';

@ObjectType()
export class ForgotPasswordOtpResponse {
  @Field()
  otp: string;
}

@ObjectType()
export class ForgotPasswordOtpVerifyResponse {
  @Field()
  resetToken: string;
}
