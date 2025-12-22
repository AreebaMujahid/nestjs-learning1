import { Mutation, Resolver, Args } from '@nestjs/graphql';
import { MapService } from './map.service';
import { LocationUpdateInputDto } from './dto/location-update.input.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/utilities/guards/auth.guard';
import { CurrentUser } from 'src/utilities/decorators/user.decorator';
import type { JwtTokenPayload } from 'src/utilities/types/token-payload';

@Resolver()
export class MapResolver {
  constructor(private readonly mapService: MapService) {}

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean)
  async updateUsersLocation(
    @Args('input') input: LocationUpdateInputDto,
    @CurrentUser() user: JwtTokenPayload,
  ) {
    return this.mapService.updateUsersLocation(input, user);
  }
}
