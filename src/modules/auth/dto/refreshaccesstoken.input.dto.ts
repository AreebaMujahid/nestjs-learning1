import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class refreshAccessTokenInput {
  @Field()
  refreshToken: string;
}
