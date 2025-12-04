import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService as Jwt, JsonWebTokenError } from '@nestjs/jwt';
import { User } from 'src/modules/user/entity/user.entity';
import { JwtTokenPurpose } from 'src/utilities/enums/jwt-token-purpose';
import { JwtTokenPayload } from '../../../utilities/types/token-payload';
@Injectable()
export class JwtAuthService {
  constructor(
    private jwtService: Jwt,
    private config: ConfigService,
  ) {}
  generateToken(
    payload: JwtTokenPayload,
    secret: string,
    expiresIn: string,
  ): string {
    return this.jwtService.sign(payload as object, {
      secret,
      expiresIn: expiresIn as any,
    });
  }

  //verify token
  verifyToken(token: string, secret: string) {
    const payload = this.jwtService.verify(token, {
      secret: this.config.get<string>('JWT_ACCESS_SECRET') || secret,
    });
    console.log('payload', payload);
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.config.get<string>('JWT_ACCESS_SECRET') || secret,
      });
      console.log('payload', payload);
      return payload;
    } catch (error: unknown) {
      const message = `Token verification failed: ${(error as JsonWebTokenError).message}`;
      throw new UnauthorizedException(message);
    }
  }

  getUserPayload(user: User, purpose: JwtTokenPurpose): JwtTokenPayload {
    //need to change issuer and audience later
    const issuer = this.config.get<string>('JWT_ISSUER') || 'cruiserslink';
    const audience = this.config.get<string>('JWT_AUDIENCE') || 'cruiserslink';
    return {
      id: crypto.randomUUID(),
      userId: parseInt(user.id.toString(), 10),
      name: user.fullName,
      email: user.email,
      purpose: purpose,
      issuer: issuer,
      audience: audience,
    };
  }
}
