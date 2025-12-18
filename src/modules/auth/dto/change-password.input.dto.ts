import { InputType } from '@nestjs/graphql';
import { Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';
import { IsStrongPassword } from 'class-validator';

@InputType()
export class ChangePasswordInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  newPassword: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  confirmNewPassword: string;
}
