import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class ForgotPasswordOtpVerifyInput {
  @Field()
  email: string;

  @Field()
  otp: string;
}
