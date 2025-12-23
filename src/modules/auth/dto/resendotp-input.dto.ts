import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class ResendOtpInputDto {
  @Field()
  email: string;
}
