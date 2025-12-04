import { Resolver, Query } from '@nestjs/graphql';
import { UserService } from './user.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/utilities/guards/auth.guard';
import { CurrentUser } from 'src/utilities/decorators/user.decorator';
import type { JwtTokenPayload } from 'src/utilities/types/token-payload';
import { User } from './dto/user.dto';
@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => User)
  @UseGuards(AuthGuard)
  meRoute(@CurrentUser() user: JwtTokenPayload) {
    return this.userService.meRoute(user);
  }
}
