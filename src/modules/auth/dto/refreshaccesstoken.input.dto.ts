import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class RefreshAccessTokenInput {
  @Field()
  refreshToken: string;
}
