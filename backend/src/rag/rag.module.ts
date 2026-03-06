import { Module } from '@nestjs/common';
import { RagController } from './rag.controller';
import { RagService } from './rag.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RagTask } from './rag-task.entity';
import { UserDailyTask } from './rag-daily-user-tasks.entity';
import { UserPointsLedger } from 'src/points/user-points-ledger.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RagTask, UserDailyTask, UserPointsLedger]),
  ],
  controllers: [RagController],
  providers: [RagService],
})
export class RagModule {}
