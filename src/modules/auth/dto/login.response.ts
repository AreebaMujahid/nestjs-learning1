import { ObjectType, Field } from '@nestjs/graphql';
import { User } from 'src/modules/user/dto/user.dto';

@ObjectType()
export class LoginResponse {
  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;

  @Field(() => User)
  user: User;
}
