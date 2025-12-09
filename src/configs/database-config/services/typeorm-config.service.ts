import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { DatabaseConfiguration } from 'src/configs/env-config/configurations/database.configuration';
import { User } from 'src/modules/user/entity/user.entity';
import { Crew } from 'src/modules/crew/entity/crew.entity';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(
    private readonly databaseConfig: DatabaseConfiguration,
    private readonly configService: ConfigService,
  ) {}

  createTypeOrmOptions(): Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions {
    return {
      type: 'postgres',
      url: this.configService.getOrThrow<string>('DATABASE_URL'),
      synchronize: this.databaseConfig.sync,
      ssl: this.databaseConfig.ssl,
      entities: [User, Crew],
      //logging: true,
      migrations: [],
      extra: {},
      migrationsTableName: 'migrations',
    };
  }
}
