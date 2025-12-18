import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SeederService } from './modules/shared/seeder/seeder.service';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });
  const seeder = app.get(SeederService);
  await seeder.seed();
  app.useGlobalPipes(new ValidationPipe());
  //for webhook
  app.use(
    '/webhook/webhook',
    bodyParser.raw({
      type: 'application/json',
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
