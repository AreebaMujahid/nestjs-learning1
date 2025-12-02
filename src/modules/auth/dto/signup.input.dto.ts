import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsString, MaxLength } from 'class-validator';
import { IsStrongPassword } from 'class-validator';
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
  @IsStrongPassword()
  password: string;
}
