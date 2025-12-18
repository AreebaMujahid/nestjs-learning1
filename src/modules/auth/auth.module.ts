import { Module } from '@nestjs/common';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entity/user.entity';
import { SharedModule } from '../shared/shared.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([User]), SharedModule, ConfigModule],
  providers: [AuthService, AuthResolver],
  exports: [AuthService],
})
export class AuthModule {}
