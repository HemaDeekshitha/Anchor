import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { MomentumService } from './momentum.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@Controller('momentum')
export class MomentumController {
  constructor(private momentumService: MomentumService) {}
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req) {
    console.log('JWT user:', req.user);

    const userId = req.user.userId; // Assuming JWT payload has 'sub' as user ID
    return this.momentumService.getProfile(userId);
  }
  @UseGuards(JwtAuthGuard)
  @Get('resume')
  async getResume(@Req() req, @Res() res: Response) {
    const userId = req.user.userId;

    return this.momentumService.streamResume(userId, res);
  }

  @UseGuards(JwtAuthGuard)
  @Post('resync-skills')
  async resyncSkills(@Req() req) {
    const userId = req.user.userId;
    return this.momentumService.resyncSkills(userId);
  }

  @UseGuards(JwtAuthGuard) // or whatever guard you use
  @Get('recent-submissions')
  async getRecentSubmissions(@Req() req) {
    return this.momentumService.getRecentSubmissions(req.user.userId);
  }
}
