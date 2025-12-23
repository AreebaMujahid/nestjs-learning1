import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignUpInput } from './dto/signup.input.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { User } from '../user/entity/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtAuthService } from '../shared/jwt/jwt.service';
import { JwtTokenPurpose } from 'src/utilities/enums/jwt-token-purpose';
import { ConfigService } from '@nestjs/config';
import { OtpPurpose } from 'src/utilities/enums/otp-purpose';
import { VerifyOtpInput } from './dto/verifyOtp.input.dto';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { FileUpload } from 'graphql-upload-ts';
import {
  ForgotPasswordInput,
  ForgotPasswordOtpInput,
} from './dto/forgotPassword.input.dto';
import { ForgotPasswordOtpVerifyInput } from './dto/forgotPasswordOtpVerify.input.dto';
import { LoginUserInput, LoginGoogleInput } from './dto/login.input.dto';
import { provider } from 'src/utilities/enums/provider';
import { RefreshAccessTokenInput } from './dto/refreshaccesstoken.input.dto';
import { JwtTokenPayload } from 'src/utilities/types/token-payload';
import { ChangePasswordInput } from './dto/change-password.input.dto';
import { CompleteProfileInput } from './dto/complete-profile.input.dto';
import { UploadService } from '../shared/upload/upload.service';
import { Crew } from '../crew/entity/crew.entity';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private jwtAuthService: JwtAuthService,
    private config: ConfigService,
    private uploadService: UploadService,
  ) {}

  private generateAuthTokens(user: User) {
    //Create payload from user object first
    const payload = this.jwtAuthService.getUserPayload(
      user,
      JwtTokenPurpose.AUTH,
    );
    const expiry = this.config.getOrThrow<string>('JWT_ACCESS_EXPIRY');
    const secret = this.config.getOrThrow<string>('JWT_ACCESS_SECRET');
    const accessToken = this.jwtAuthService.generateToken(
      payload,
      secret,
      expiry,
    );
    const refreshExpiry = this.config.getOrThrow<string>('JWT_REFRESH_EXPIRY');
    const refreshSecret = this.config.getOrThrow<string>('JWT_REFRESH_SECRET');
    const refreshToken = this.jwtAuthService.generateToken(
      payload,
      refreshSecret,
      refreshExpiry,
    );
    console.log(accessToken);
    return { accessToken, refreshToken };
  }
  private generateOtp() {
    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpiry = Date.now() + 5 * 60 * 1000; // 5min expiry of otp
    return { otp, otpExpiry };
  }
  async signUp(signUpInput: SignUpInput) {
    const normalizedEmail = signUpInput.email.toLowerCase();
    const existingUser = await this.userRepository.findOne({
      where: { email: normalizedEmail },
    });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    const hashedPassword = await bcrypt.hash(signUpInput.password, 10);
    const newUser = this.userRepository.create({
      fullName: signUpInput.fullName,
      email: normalizedEmail,
      password: hashedPassword,
    });
    const result = this.generateOtp();
    newUser.activeOtp = result.otp.toString();
    newUser.otpDuration = result.otpExpiry;
    newUser.otpPurpose = OtpPurpose.EMAIL_VERIFICATION;
    const savedUser = await this.userRepository.save(newUser);
    const tokens = this.generateAuthTokens(savedUser);
    //return Object.assign(tokens);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      otp: savedUser.activeOtp,
    };
  }
  async verifyEmail(verifyOtpInput: VerifyOtpInput) {
    const normalizedEmail = verifyOtpInput.email.toLowerCase();
    const user = await this.userRepository.findOne({
      where: { email: normalizedEmail },
    });
    if (!user) {
      throw new NotFoundException('User does not exists');
    }
    if (user.isEmailVerified) {
      throw new BadRequestException('Email already verified');
    }
    if (!user.activeOtp || user.activeOtp !== verifyOtpInput.otp) {
      throw new UnauthorizedException('Otp is invalid or incorrect');
    }
    //otp expiration check
    const currentTime = Date.now();
    if (user.otpDuration && currentTime > user.otpDuration) {
      throw new UnauthorizedException('Otp has been expired');
    }
    //otp purpose check
    if (user.otpPurpose !== OtpPurpose.EMAIL_VERIFICATION) {
      throw new UnauthorizedException('Invalid Otp for email verification');
    }
    user.isEmailVerified = true;
    //removing otp from user object , after email verification
    user.activeOtp = '';
    user.otpPurpose = '';
    const savedUser = await this.userRepository.save(user);
    return true;
  }
  async sendForgotPasswordOtp(forgotPasswordOtpInput: ForgotPasswordOtpInput) {
    const normalizedEmail = forgotPasswordOtpInput.email.toLowerCase();
    const user = await this.userRepository.findOne({
      where: { email: normalizedEmail },
    });
    if (!user) {
      throw new Error('User does not exists');
    }
    const otpCred = this.generateOtp();
    user.activeOtp = otpCred.otp.toString();
    user.otpDuration = otpCred.otpExpiry;
    user.otpPurpose = OtpPurpose.FORGOT_PASSWORD;
    const savedUser = await this.userRepository.save(user);
    return {
      otp: savedUser.activeOtp,
    };
  }
  async forgotPasswordOtpVerify(
    forgotPasswordOtpVerifyInput: ForgotPasswordOtpVerifyInput,
  ) {
    const normalizedEmail = forgotPasswordOtpVerifyInput.email.toLowerCase();
    const user = await this.userRepository.findOne({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new Error('User with this email does not exists');
    }

    if (user.activeOtp && user.activeOtp !== forgotPasswordOtpVerifyInput.otp) {
      throw new BadRequestException('Invalid or expired Otp');
    }

    //otp expire check
    const currentTime = Date.now();
    if (user.otpDuration && currentTime > user.otpDuration) {
      throw new BadRequestException('Your Otp Expired');
    }

    const payload = this.jwtAuthService.getUserPayload(
      user,
      JwtTokenPurpose.PASSWORD_RESET,
    );

    const resetToken = this.jwtAuthService.generateToken(
      payload,
      this.config.getOrThrow('JWT_ACCESS_SECRET'),
      this.config.getOrThrow('JWT_ACCESS_EXPIRY'),
    );

    user.activeOtp = '';
    user.otpPurpose = '';
    const savedUser = await this.userRepository.save(user);
    return {
      resetToken: resetToken,
    };
  }
  async forgotPassword(forgotPasswordInput: ForgotPasswordInput) {
    const payload = this.jwtAuthService.verifyToken(
      forgotPasswordInput.resetToken,
      this.config.getOrThrow('JWT_ACCESS_SECRET'),
    );
    if (!payload.userId) {
      throw new BadRequestException('Invalid payload');
    }
    const user = await this.userRepository.findOne({
      where: { id: payload.userId },
    });
    if (!user) {
      throw new Error('User does not exists');
    }
    if (payload.purpose !== JwtTokenPurpose.PASSWORD_RESET) {
      throw new BadRequestException('Invalid token for password reset');
    }
    user.password = await bcrypt.hash(forgotPasswordInput.newPassword, 10);
    const savedUser = await this.userRepository.save(user);
    return true;
  }
  async login(loginUserInput: LoginUserInput) {
    const normalizedEmail = loginUserInput.email.toLowerCase();
    const user = await this.userRepository.findOne({
      where: { email: normalizedEmail },
    });
    if (!user) {
      throw new UnauthorizedException('Email does not exists');
    }
    let passwordMatch;
    if (user.password) {
      passwordMatch = await bcrypt.compare(
        loginUserInput.password,
        user.password,
      );
    }
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }
    let tokens;
    try {
      tokens = this.generateAuthTokens(user);
    } catch (error) {
      console.error('JWT token generation error:', error);
    }
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: user,
    };
  }
  async loginWithGoogle({ idToken }: LoginGoogleInput) {
    const verification = new OAuth2Client(
      this.config.getOrThrow<string>('GOOGLE_AUTH_CLIENT_ID'),
    );
    const ticket = await verification.verifyIdToken({
      idToken,
      audience: this.config.getOrThrow<string>('GOOGLE_AUTH_CLIENT_ID'),
    });
    const payload = ticket.getPayload();
    const { email, name, profile } = payload as TokenPayload;
    const user = await this.userRepository.findOne({
      where: { email: email },
    });
    let tokens;
    //if user not exists, create user
    if (!user) {
      const newUser = this.userRepository.create({
        email,
        fullName: name,
        isEmailVerified: true,
        provider: provider.GOOGLE,
        profilePicture: profile,
      });
      console.log(newUser);

      const savedUser = await this.userRepository.save(newUser);
      tokens = this.generateAuthTokens(savedUser);
    } else {
      tokens = this.generateAuthTokens(user);
    }
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: user,
    };
  }
  async refreshAccessToken(refreshAccessTokenInput: RefreshAccessTokenInput) {
    const payload = this.jwtAuthService.verifyToken(
      refreshAccessTokenInput.refreshToken,
      this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
    );
    const user = await this.userRepository.findOne({
      where: { id: payload.userId },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid payload');
    }
    const tokens = this.generateAuthTokens(user);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: user,
    };
  }
  async changePassword(
    changePasswordInput: ChangePasswordInput,
    user: JwtTokenPayload,
  ) {
    const dbUser = await this.userRepository.findOne({
      where: { id: user.userId },
    });
    if (!dbUser) {
      throw new BadRequestException('User does not exists');
    }
    if (dbUser.password) {
      const isMatch = await bcrypt.compare(
        dbUser.password,
        changePasswordInput.currentPassword,
      );
      if (!isMatch) {
        throw new ForbiddenException('Current password is incorrect');
      }
    }
    if (
      changePasswordInput.currentPassword === changePasswordInput.newPassword
    ) {
      throw new ForbiddenException(
        'New Password must be different from current password',
      );
    }
    dbUser.password = await bcrypt.hash(changePasswordInput.newPassword, 10);
    await this.userRepository.save(dbUser);
    return true;
  }
  async completeProfile(
    input: CompleteProfileInput,
    //profilePicture: Promise<FileUpload> | null,
    user: JwtTokenPayload,
  ) {
    //TODO: country name validation
    try {
      // let s3Url: string | undefined = undefined;
      // if (profilePicture) {
      //   const { createReadStream, filename } = await profilePicture;
      //   const fileBuffer = await new Promise<Buffer>((resolve, reject) => {
      //     const chunks: Buffer[] = [];
      //     createReadStream()
      //       .on('data', (chunk) => chunks.push(chunk))
      //       .on('end', () => resolve(Buffer.concat(chunks)))
      //       .on('error', reject);
      //   });
      //   s3Url = await this.uploadService.upload(filename, fileBuffer);
      // }
      const userEntity = await this.userRepository.findOne({
        where: { id: user.userId },
        relations: ['crew'],
      });
      if (!userEntity) throw new Error('User not found');
      Object.assign(userEntity, {
        boatName: input.boatName || userEntity.boatName,
        contactNumber: input.contactNumber || userEntity.contactNumber,
        ownerCaptain: input.ownerCaptain || userEntity.ownerCaptain,
        websiteUrl: input.websiteUrl || userEntity.websiteUrl,
        countryName: input.countryName || userEntity.countryName,
        isProfileComplete: true,
      });
      // if (s3Url) {
      //   userEntity.profilePicture = s3Url;
      // }
      const queryRunner =
        this.userRepository.manager.connection.createQueryRunner();
      await queryRunner.manager.save(userEntity);
      try {
        await queryRunner.connect();
        await queryRunner.startTransaction();
        if (input.crew?.length) {
          for (const c of input.crew) {
            const newCrew = queryRunner.manager.create(Crew, {
              ...c,
              user: userEntity,
            });
            await queryRunner.manager.save(Crew, newCrew);
          }
        }
        await queryRunner.commitTransaction();
        return true;
      } catch {
        if (queryRunner) {
          await queryRunner.commitTransaction();
        }
        console.error();
      } finally {
        if (queryRunner) {
          await queryRunner.release();
        }
      }
    } catch (err) {
      console.error(`Error while completeing profile: ${err.message}`);
    }
  }
}
