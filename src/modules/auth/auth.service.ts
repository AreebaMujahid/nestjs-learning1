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
    const savedUser = await this.userRepository.save(user);
    return true;
  }
}
