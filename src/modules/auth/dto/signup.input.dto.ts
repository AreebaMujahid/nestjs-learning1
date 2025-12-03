import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsString, MaxLength } from 'class-validator';
import { StrongPassword } from 'src/utilities/decorators/strong-password.decorator';
@InputType()
export class SignUpInput {
  @Field()
  @IsString()
  @MaxLength(20)
  fullName: string;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  @StrongPassword()
  password: string;
}
