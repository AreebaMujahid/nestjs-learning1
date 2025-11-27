import { Resolver, Query } from '@nestjs/graphql';
@Resolver()
export class AuthResolver {
  @Query(() => String)
  healthCheck() {
    return 'Auth service is running';
  }
}
