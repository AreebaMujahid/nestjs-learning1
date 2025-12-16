import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UserService } from './user.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/utilities/guards/auth.guard';
import { CurrentUser } from 'src/utilities/decorators/user.decorator';
import type { JwtTokenPayload } from 'src/utilities/types/token-payload';
import { User } from './dto/user.dto';
import { UpdateProfileSettingInput } from './dto/update-profile-setting.dto';
import { GraphQLUpload, FileUpload } from 'graphql-upload-ts';
import { UploadService } from '../shared/upload/upload.service';
import { createReadStream } from 'fs';
@Resolver()
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private uploadService: UploadService,
  ) {}

  @Query(() => User)
  @UseGuards(AuthGuard)
  getProfile(@CurrentUser() user: JwtTokenPayload) {
    return this.userService.meRoute(user);
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  async editSetting(
    @Args('input') input: UpdateProfileSettingInput,
    @Args({ name: 'profilePicture', type: () => GraphQLUpload, nullable: true })
    profilePicture: Promise<FileUpload> | null,
    @CurrentUser() user: JwtTokenPayload,
  ) {
    let photoUrl: string | null | undefined;
    if (profilePicture) {
      try {
        const { createReadStream, filename } = await profilePicture;
        // Convert stream to buffer
        const buffer = await new Promise<Buffer>((resolve, reject) => {
          const chunks: Buffer[] = [];
          createReadStream()
            .on('data', (chunk) => chunks.push(chunk))
            .on('end', () => resolve(Buffer.concat(chunks)))
            .on('error', (err) => reject(err));
        });
        //unique file name
        const fileKey = `${Date.now()}-profile-${filename}`;
        photoUrl = await this.uploadService.upload(fileKey, buffer);
      } catch (err) {}
    } else if (typeof input.profilePictureUrl !== 'undefined') {
      // If empty string or null, that means delete
      if (input.profilePictureUrl === null || input.profilePictureUrl === '') {
        photoUrl = null;
      } else if (typeof input.profilePictureUrl === 'string') {
        photoUrl = input.profilePictureUrl;
      }
    }
    return this.userService.editSetting(user, {
      ...input,
      profilePicture: photoUrl,
    });
  }
}
