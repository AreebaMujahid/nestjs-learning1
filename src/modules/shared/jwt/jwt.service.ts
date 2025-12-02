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
  generateToken(payload: JwtTokenPayload, secret: string, expiresIn: string) {
    return this.jwtService.sign(payload, {
      secret: secret,
      expiresIn: parseInt(expiresIn),
    });
  }
  //verify token
  verifyToken(token: string, secret: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: secret || this.config.get<string>('JWT_ACCESS_SECRET'),
      });
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
