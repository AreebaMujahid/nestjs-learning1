import { InputType } from '@nestjs/graphql';
import { Field } from '@nestjs/graphql';
import { StrongPassword } from 'src/utilities/decorators/strong-password.decorator';

@InputType()
export class ForgotPasswordOtpInput {
  @Field()
  email: string;
}

@InputType()
export class ForgotPasswordInput {
  @Field()
  resetToken: string;

  @Field()
  @StrongPassword()
  newPassword: string;
}
