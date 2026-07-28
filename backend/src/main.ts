// Polyfill globalThis.crypto for Node.js 18 (required by @nestjs/schedule v6)
import { webcrypto } from 'node:crypto';
if (!globalThis.crypto) {
  Object.defineProperty(globalThis, 'crypto', { value: webcrypto });
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import type { Express, NextFunction, Request, Response } from 'express';

import * as dotenv from 'dotenv';
dotenv.config();

function verifyMutationOrigin(allowedOrigins: Set<string>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const safe = ['GET', 'HEAD', 'OPTIONS'].includes(req.method);
    const origin = req.headers.origin;
    if (!safe && origin && !allowedOrigins.has(origin)) {
      res.status(403).json({ message: 'Request origin is not allowed' });
      return;
    }
    next();
  };
}
// T: O(1) and S: O(1)

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const expressApp = app.getHttpAdapter().getInstance() as Express;
  expressApp.set('trust proxy', 1);
  app.use(cookieParser());
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );
  const allowedOrigins = new Set(
    (
      process.env.CORS_ORIGINS ??
      'http://localhost:3000,http://localhost:3002,http://localhost:3003,http://localhost:3013,http://localhost:3014,https://anchor.feeltiptop.com,https://anchorapp.feeltiptop.com'
    )
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  );
  app.use(verifyMutationOrigin(allowedOrigins));
  app.enableCors({
    origin: [...allowedOrigins],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.enableShutdownHooks();
  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port, '0.0.0.0');
  console.log(`Backend running on http://localhost:${port}`);
}
// T: O(1) startup work and S: O(1)

void bootstrap();
