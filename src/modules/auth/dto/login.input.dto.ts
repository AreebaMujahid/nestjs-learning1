import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class LoginUserInput {
  @Field()
  email: string;

  @Field()
  password: string;
}

@InputType()
export class LoginGoogleInput {
  @Field()
  idToken: string;
}
