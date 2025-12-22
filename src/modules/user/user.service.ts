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
    const dbUser = await this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.crew', 'crew')
      .where('user.id= :id', { id: user.userId })
      .getOne();

    if (!dbUser) {
      throw new NotFoundException('User not found');
    }
    return {
      ...dbUser,
      currentLocation: {
        latitude: dbUser.currentLocation?.coordinates[1],
        longitude: dbUser.currentLocation?.coordinates[0],
      },
    };
  }
  // async editProfile(editProfileInput: EditProfileInput, user: JwtTokenPayload) {
  //   const hasCrewUpdate = !!editProfileInput.crew?.length;
  //   const queryRunner = hasCrewUpdate
  //     ? this.userRepo.manager.connection.createQueryRunner()
  //     : null;
  //   try {
  //     if (queryRunner) {
  //       await queryRunner.connect();
  //       await queryRunner.startTransaction();
  //     }
  //     const manager = queryRunner ? queryRunner.manager : this.userRepo.manager;
  //     const userEntity = await this.userRepo.findOne({
  //       where: { id: user.userId },
  //       relations: ['crew'],
  //     });
  //     if (!userEntity) {
  //       throw new BadRequestException('User does not exists');
  //     }
  //     console.log(userEntity);
  //     Object.assign(userEntity, editProfileInput);
  //     await manager.save(userEntity);
  //     if (editProfileInput.crew?.length) {
  //       for (const c of editProfileInput.crew) {
  //         const queryRunner =
  //           this.userRepo.manager.connection.createQueryRunner();
  //         await queryRunner.connect();
  //         await queryRunner.startTransaction();
  //         if (c.id) {
  //           const existingCrew = await queryRunner.manager.findOne(Crew, {
  //             where: { id: c.id },
  //           });
  //           if (existingCrew) {
  //             Object.assign(existingCrew, c);
  //             await queryRunner.manager.save(existingCrew);
  //           }
  //         } else {
  //           const newCrew = queryRunner.manager.create(Crew, {
  //             ...c,
  //             user: userEntity,
  //           });
  //           await queryRunner.manager.save(newCrew);
  //         }
  //       }
  //     }
  //     if (queryRunner) {
  //       await queryRunner.commitTransaction();
  //     }
  //     return true;
  //   } catch (err) {
  //     if (queryRunner) {
  //       await queryRunner.rollbackTransaction();
  //     }
  //     throw err;
  //   } finally {
  //     if (queryRunner) {
  //       await queryRunner.release();
  //     }
  //   }
  //   const filteredDto = Object.fromEntries(
  //     Object.entries(restDto).filter(
  //       ([key, value]) => value !== undefined && value !== null && value !== '',
  //     ),
  //   );
  //   const updatedUserEntity = Object.assign(dbUser, filteredDto);

  //   //TODO: update or delete user profile photo if provided

  //   const updated = await this.userRepo.save(updatedUserEntity);
  //   return true;
  // }
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
