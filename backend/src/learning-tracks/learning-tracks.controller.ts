import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CreateLearningTrackDto } from './dto/create-learning-track.dto';
import { LearningTracksService } from './learning-tracks.service';

@Controller('learning-tracks')
@UseGuards(JwtAuthGuard)
export class LearningTracksController {
  constructor(private readonly learningTracksService: LearningTracksService) {}

  @Get('options')
  getOptions() {
    return this.learningTracksService.getOptions();
  }

  @Get('current')
  async getCurrent(@Req() req: Request) {
    const userId = (req.user as { userId: string }).userId;
    return { track: await this.learningTracksService.getCurrent(userId) };
  }

  @Post()
  create(@Req() req: Request, @Body() dto: CreateLearningTrackDto) {
    const userId = (req.user as { userId: string }).userId;
    return this.learningTracksService.create(userId, dto);
  }

  @Patch('current')
  update(@Req() req: Request, @Body() dto: CreateLearningTrackDto) {
    const userId = (req.user as { userId: string }).userId;
    return this.learningTracksService.update(userId, dto);
  }
}
