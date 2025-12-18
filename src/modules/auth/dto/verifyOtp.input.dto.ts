import { InputType, Field } from '@nestjs/graphql';
import { IsEmail } from 'class-validator';
@InputType()
export class VerifyOtpInput {
  @Field()
  otp: string;

  @Field()
  @IsEmail()
  email: string;
}
