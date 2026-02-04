import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  // app.setGlobalPrefix('api');

  app.enableCors({
    origin: ['http://localhost:3000', 'https://anchor.feeltiptop.com'],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
  });

  await app.listen(3001, '0.0.0.0');
  console.log('Backend running on http://localhost:3001');
}
bootstrap();
