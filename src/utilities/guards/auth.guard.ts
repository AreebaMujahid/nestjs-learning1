import { JwtTokenPayload } from '../types/token-payload';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthService } from 'src/modules/shared/jwt/jwt.service';
import { ConfigService } from '@nestjs/config';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';

declare module 'express' {
  export interface Request {
    user?: JwtTokenPayload;
  }
}
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtAuthService: JwtAuthService,
    private readonly config: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const token = this.extractTokenFromHeader(context);
    if (!token) {
      throw new UnauthorizedException(
        'Authorization token is missing in header',
      );
    }
    try {
      const payload = this.jwtAuthService.verifyToken(
        token,
        this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      );
      if (!payload) {
        throw new BadRequestException('InValid token');
      }
      if (context.getType() === 'http') {
        const request = context.switchToHttp().getRequest<Request>();
        request.user = payload;
      } else {
        const ctx = GqlExecutionContext.create(context).getContext();
        ctx.user = payload;
        if (ctx.req) {
          ctx.req.user = payload;
        }
      }
      return true;
    } catch (err) {
      throw new UnauthorizedException(err.message);
    }
  }

  private extractTokenFromHeader(
    context: ExecutionContext,
  ): string | undefined {
    const type = context.getType();
    if (type === 'http') {
      const request = context.switchToHttp().getRequest<Request>();
      const authHeader = request.headers['authorization'];
      if (!authHeader) return undefined;
      const [type, token] = authHeader.split(' ');
      return type === 'Bearer' ? token : undefined;
    } else {
      const ctx = GqlExecutionContext.create(context).getContext();
      const req = ctx.req;
      const authHeader = req.headers.autherization;
      if (!authHeader) return undefined;
      const [type, token] = authHeader.split(' ');
      return type === 'Bearer' ? token : undefined;
    }
  }
}
