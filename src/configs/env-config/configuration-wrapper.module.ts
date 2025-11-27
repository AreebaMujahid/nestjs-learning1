import { ConfigModule } from '@nestjs/config';
import { validationSchema } from './validation.schema';
import { Module } from '@nestjs/common';
import { DatabaseConfiguration } from './configurations/database.configuration';
const configurations = [DatabaseConfiguration];
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
    }),
  ],
  exports: [DatabaseConfiguration, ...configurations],
  providers: [DatabaseConfiguration, ...configurations],
})
export class ConfigWrapperModule {}
