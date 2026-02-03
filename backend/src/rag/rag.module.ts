import { Module } from '@nestjs/common';
import { RagController } from './rag.controller';
import { RagService } from './rag.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RagTask } from './rag-task.entity';
import { UserDailyTask } from './rag-daily-user-tasks.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RagTask, UserDailyTask])],
  controllers: [RagController],
  providers: [RagService],
})
export class RagModule {}
