import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointsController } from './points.controller';
import { PointsService } from './points.service';
import { UserPointsLedger } from './user-points-ledger.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserPointsLedger,
      User, // needed so PointsService can update users.points_360
    ]),
  ],
  controllers: [PointsController],
  providers: [PointsService],
  exports: [PointsService], // exported so SubmissionModule can inject it
})
export class PointsModule {}
