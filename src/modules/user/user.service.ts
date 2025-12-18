import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { JwtTokenPayload } from 'src/utilities/types/token-payload';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { UpdateProfileSettingInput } from './dto/update-profile-setting.dto';
import { OtpPurpose } from 'src/utilities/enums/otp-purpose';
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

  async editSetting(
    user: JwtTokenPayload,
    input: UpdateProfileSettingInput & { profilePicture?: string | null },
  ) {
    const { ...restDto } = input;
    const dbUser = await this.userRepo.findOne({
      where: { id: user.userId },
    });
    if (!dbUser) {
      throw new NotFoundException('User not found');
    }
    const filteredDto = Object.fromEntries(
      Object.entries(restDto).filter(
        ([key, value]) => value !== undefined && value !== null && value !== '',
      ),
    );
    const updatedUserEntity = Object.assign(dbUser, filteredDto);

    //TODO: update or delete user profile photo if provided

    const updated = await this.userRepo.save(updatedUserEntity);
    return true;
  }
}
