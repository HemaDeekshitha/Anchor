// C:\Users\nsais\Anchor\backend\src\application-tracker\application-tracker.controller.ts
import {
  BadRequestException,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GmailService } from './gmail.service';
import { GmailConnection } from './entities/gmail-connection.entity';
import { ApplicationTrackerService } from './application-tracker.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('application-tracker/gmail')
export class ApplicationTrackerController {
  private readonly logger = new Logger(ApplicationTrackerController.name);

  constructor(
    private readonly gmailService: GmailService,
    private readonly applicationTrackerService: ApplicationTrackerService,
    @InjectRepository(GmailConnection)
    private gmailRepo: Repository<GmailConnection>
  ) {}

  // Step 1: Redirect user to Google consent
  @Get('connect')
  @UseGuards(JwtAuthGuard)
  async connect(@Req() req, @Res() res, @Query('userId') userIdFromQuery?: string) {
    const userId = req.user?.userId || userIdFromQuery;

    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    this.logger.log(`gmail-consent-init user=${userId}`);

    const url = this.gmailService.getAuthUrl(userId);
    return res.redirect(url);
  }

  // Step 2: Google redirects here
  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('state') userId: string,
    @Res() res,
  ) {
    const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const successRedirect = `${frontendBaseUrl}/application-tracker?gmail=connected`;
    const failedRedirect = `${frontendBaseUrl}/application-tracker?gmail=failed`;

    try {
      if (!code || !userId) {
        return res.redirect(failedRedirect);
      }

      const tokens = await this.gmailService.getTokensFromCode(code);

      this.logger.log(
        `gmail-consent-callback user=${userId} status=success hasAccessToken=${Boolean(tokens.access_token)} hasRefreshToken=${Boolean(tokens.refresh_token)} hasExpiry=${Boolean(tokens.expiry_date)}`,
      );

      const existingConnection = await this.gmailRepo.findOne({
        where: { user: { id: userId } },
        relations: ['user'],
      });

      const connection = existingConnection ?? this.gmailRepo.create({ user: { id: userId } });
      connection.gmailEmail = 'fetch-later';
      connection.accessToken = tokens.access_token ?? '';
      connection.refreshToken = tokens.refresh_token ?? connection.refreshToken ?? '';
      connection.tokenExpiry = tokens.expiry_date
        ? new Date(tokens.expiry_date)
        : connection.tokenExpiry;
      connection.status = 'active';

      await this.gmailRepo.save(connection);

      return res.redirect(successRedirect);
    } catch (error) {
      this.logger.log(
        `gmail-consent-callback user=${userId || 'unknown'} status=failed reason=${error instanceof Error ? error.message : 'unknown'}`,
      );
      return res.redirect(failedRedirect);
    }
  }

  @Post('scan')
  @UseGuards(JwtAuthGuard)
  async scan(@Req() req, @Query('userId') userIdFromQuery?: string) {
    const userId = req.user?.userId || userIdFromQuery;

    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    const result = await this.applicationTrackerService.scanGmail(userId);

    return {
      message: 'Gmail scan completed',
      ...result,
    };
  }

  @Post('scan/internal')
  async scanInternal(@Req() req, @Query('userId') userId?: string) {
    const cronSecret = req.headers['x-cron-secret'];
    const expectedCronSecret = process.env.APPLICATION_TRACKER_CRON_SECRET;

    if (!expectedCronSecret || cronSecret !== expectedCronSecret) {
      throw new UnauthorizedException('Unauthorized');
    }

    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    const result = await this.applicationTrackerService.scanGmail(userId);

    return {
      message: 'Gmail scan completed',
      ...result,
    };
  }

  @Get('jobs')
  @UseGuards(JwtAuthGuard)
  async getJobs(@Req() req, @Query('userId') userIdFromQuery?: string) {
    const userId = req.user?.userId || userIdFromQuery;

    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    return this.applicationTrackerService.getJobsForUser(userId);
  }
}