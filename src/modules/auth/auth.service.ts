import { Injectable } from '@nestjs/common';
import { SignUpInput } from './dto/signup.input.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entity/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtAuthService } from '../shared/jwt/jwt.service';
import { JwtTokenPurpose } from 'src/utilities/enums/jwt-token-purpose';
import { ConfigService } from '@nestjs/config';

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
    //todo: email verification using OTP
    const savedUser = await this.userRepository.save(newUser);
    const tokens = this.generateAuthTokens(savedUser);
    return Object.assign(tokens);
  }
}
