import { Controller, Post, Req, Res, HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express'; // Import Request from express
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Post('init')
  async initDashboard(@Req() req: Request, @Res() res: Response) {
    // 1. Log the entire body to debug
    console.log('🔹 Raw Body Received:', req.body);

    // 2. Access data directly from req.body
    const userId = req.body?.userId;

    if (!userId) {
      console.log('❌ UserId is missing in body');
      return res.status(400).json({ error: 'Missing userId' });
    }

    try {
      const result = await this.dashboardService.getDashboardData(userId);
      return res.status(200).json(result);
    } catch (error) {
      console.error('❌ ERROR in /dashboard/init:', error);
      return res.status(500).json({ error: error.message });
    }
  }
}
