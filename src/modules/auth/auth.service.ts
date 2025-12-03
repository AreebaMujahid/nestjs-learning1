import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignUpInput } from './dto/signup.input.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entity/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtAuthService } from '../shared/jwt/jwt.service';
import { JwtTokenPurpose } from 'src/utilities/enums/jwt-token-purpose';
import { ConfigService } from '@nestjs/config';
import { OtpPurpose } from 'src/utilities/enums/otp-purpose';
import { VerifyOtpInput } from './dto/verifyOtp.input.dto';
import {
  ForgotPasswordInput,
  ForgotPasswordOtpInput,
} from './dto/forgotPassword.input.dto';
import { ForgotPasswordOtpVerifyInput } from './dto/forgotPasswordOtpVerify.input.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private jwtAuthService: JwtAuthService,
    private config: ConfigService,
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
    const user = await this.userRepository.findOne({
      where: { email: verifyOtpInput.email },
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
    const user = await this.userRepository.findOne({
      where: { email: forgotPasswordOtpInput.email },
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
    const user = await this.userRepository.findOne({
      where: { email: forgotPasswordOtpVerifyInput.email },
    });

    if (!user) {
      throw new Error('User with this email does not exists');
    }

    if (user.activeOtp && user.activeOtp !== forgotPasswordOtpVerifyInput.otp) {
      throw new UnauthorizedException('Invalid or expired Otp');
    }

    //otp expire check
    const currentTime = Date.now();
    if (user.otpDuration && currentTime > user.otpDuration) {
      throw new UnauthorizedException('Your Otp Expired');
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
    const user = await this.userRepository.findOne({
      where: { id: payload.userId },
    });

    if (!user) {
      throw new Error('User does not exists');
    }

    if (payload.purpose !== JwtTokenPurpose.PASSWORD_RESET) {
      throw new UnauthorizedException('Invalid token for password reset');
    }

    user.password = await bcrypt.hash(forgotPasswordInput.newPassword, 10);
    const savedUser = await this.userRepository.save(user);
    return true;
  }
}
