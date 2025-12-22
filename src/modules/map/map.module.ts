import { Module } from '@nestjs/common';
import { MapService } from './map.service';
import { MapResolver } from './map.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entity/user.entity';
import { SharedModule } from '../shared/shared.module';
import { ConfigModule } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    SharedModule,
    ConfigModule,
    HttpModule,
  ],
  providers: [MapService, MapResolver],
})
export class MapModule {}
