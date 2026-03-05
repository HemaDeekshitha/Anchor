import { BadRequestException, Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req) {
    const userId = req.user?.userId;

    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    return this.usersService.getMe(userId);
  }
}
