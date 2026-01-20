import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';

import type { Response } from 'express';

import { DashboardService } from './dashboard.service'; // ✅ This will now work

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Post('init')
  async initDashboard(@Body() body: any, @Res() res: Response) {
    const { userId } = body;
    if (!userId) {
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
