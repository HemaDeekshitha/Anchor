import {
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { PointsService } from './points.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import type { Request } from 'express';

@Controller('points')
@UseGuards(JwtAuthGuard)
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  /**
   * GET /api/points/me
   *
   * Returns the authenticated user's current Anchor Points balance,
   * 360 Points count, conversion progress, and full earn/spend history.
   *
   * Example response:
   * {
   *   "anchorPoints": 275,
   *   "points360": 1,
   *   "pointsToNextConversion": 225,
   *   "progressPercent": 55,
   *   "canConvert": false,
   *   "history": [
   *     { "id": 12, "type": "task_earned", "amount": 25, "taskId": 44, "createdAt": "..." },
   *     { "id": 5,  "type": "converted_to_360", "amount": -500, "taskId": null, "createdAt": "..." }
   *   ]
   * }
   */
  @Get('me')
  async getMyPoints(@Req() req: Request) {
    if (!req.user) {
      throw new BadRequestException('User not authenticated');
    }
    return this.pointsService.getSummary(req.user.userId);
  }

  /**
   * POST /api/points/convert
   *
   * Converts 500 Anchor Points into 1 "360 Point".
   * Returns the updated balance after the conversion.
   *
   * Fails with 400 if the user has fewer than 500 Anchor Points.
   */
  @Post('convert')
  async convertTo360(@Req() req: Request) {
    if (!req.user) {
      throw new BadRequestException('User not authenticated');
    }
    return this.pointsService.convertTo360(req.user.userId);
  }
}
