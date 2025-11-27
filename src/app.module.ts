import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Request, Response } from 'express';
import { NestModule } from '@nestjs/common';
import { AuthResolver } from './modules/auth/auth.resolver';
import { UserModule } from './modules/user/user.module';
import { CrewModule } from './modules/crew/crew.module';
import { AuthModule } from './modules/auth/auth.module';
import { graphqlUploadExpress } from 'graphql-upload-ts';
import { DatabaseWrapperModule } from './configs/database-config/database-wrapper.module';
import { ConfigWrapperModule } from './configs/env-config/configuration-wrapper.module';
import { ConfigModule } from '@nestjs/config';
const env = process.env.NODE_ENV || 'development';
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env${env === 'development' ? '' : '.' + env}`,
      isGlobal: true, // ConfigService available globally
    }),
    ConfigWrapperModule,
    DatabaseWrapperModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      introspection: true,
      playground: true,
      context: ({ req, res }: { req: Request; res: Response }) => ({
        req,
        res,
      }),
    }),
    UserModule,
    CrewModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, AuthResolver],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        graphqlUploadExpress({
          maxFileSize: 50000000, //50mb maximumn file size
          maxFiles: 10, //max 10 files
        }),
      )
      .forRoutes('graphql');
  }
}
