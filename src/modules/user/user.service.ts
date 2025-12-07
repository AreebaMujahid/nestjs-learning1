import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { JwtTokenPayload } from 'src/utilities/types/token-payload';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';
@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  async meRoute(user: JwtTokenPayload) {
    const dbUser = await this.userRepo.findOne({
      where: { id: user.userId },
    });
    if (!dbUser) {
      throw new NotFoundException('User not found');
    }
    return dbUser;
  }
}
