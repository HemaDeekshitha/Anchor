import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type { Response } from 'express';
import { MomentumService } from './momentum.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { UpdateMomentumProfileDto } from './dto/momentum-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('momentum')
export class MomentumController {
  constructor(private momentumService: MomentumService) {}
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req) {
    const userId = req.user.userId; // Assuming JWT payload has 'sub' as user ID
    return this.momentumService.getProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(@Req() req, @Body() dto: UpdateMomentumProfileDto) {
    return this.momentumService.updateProfile(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('resume')
  async getResume(@Req() req, @Res() res: Response) {
    const userId = req.user.userId;

    return this.momentumService.streamResume(userId, res);
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile/avatar')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  async uploadAvatar(@Req() req, @UploadedFile() file: Express.Multer.File) {
    return this.momentumService.updateAvatar(req.user.userId, file);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('profile/avatar')
  async removeAvatar(@Req() req) {
    return this.momentumService.removeAvatar(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile/resume')
  @UseInterceptors(FileInterceptor('file'))
  async uploadResume(@Req() req, @UploadedFile() file: Express.Multer.File) {
    return this.momentumService.updateResume(req.user.userId, file);
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
