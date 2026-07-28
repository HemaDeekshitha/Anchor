import 'dotenv/config';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrapWorker(): Promise<void> {
  process.env.COMMUNITY_WORKER_ENABLED = 'true';
  const application = await NestFactory.createApplicationContext(AppModule);
  application.enableShutdownHooks();
  new Logger('CommunityWorker').log('Community BullMQ worker is ready');
}
// T: O(1) startup work and S: O(1)

void bootstrapWorker();
