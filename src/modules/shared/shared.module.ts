import { Module } from '@nestjs/common';
import { JwtAuthService } from './jwt/jwt.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
const services = [JwtAuthService];
@Module({
  imports: [
    ConfigModule, // ensures ConfigService is available
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        global: true,
        secret: config.get<string>('JWT_ACCESS_SECRET') as string,
        signOptions: {
          expiresIn: parseInt(config.getOrThrow<string>('JWT_ACCESS_EXPIRY')),
        },
      }),
    }),
  ],
  providers: [...services],
  exports: [...services],
})
export class SharedModule {}
