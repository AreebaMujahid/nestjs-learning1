import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ConfigWrapperModule } from '../env-config/configuration-wrapper.module';
import { DatabaseConfiguration } from '../env-config/configurations/database.configuration';
import { TypeOrmConfigService } from './services/typeorm-config.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigWrapperModule],
      inject: [DatabaseConfiguration],
      useClass: TypeOrmConfigService,
    }),
    ConfigWrapperModule,
  ],
  exports: [TypeOrmConfigService],
  providers: [TypeOrmConfigService],
})
export class DatabaseWrapperModule {}
