import {
  Controller,
  Post,
  Body,
  Res,
  Get,
  UseGuards,
  Req,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import type { Response, Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

const isProd = process.env.NODE_ENV === 'production';

// Cookie options that work across feeltiptop.com subdomains in production
// while keeping local dev behavior unchanged.
const cookieBaseOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: (isProd ? 'none' : 'lax') as 'none' | 'lax',
  ...(isProd && { domain: '.feeltiptop.com' }),
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(
    @Body() dto: SignupDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.signup(dto);

    res.cookie('access_token', accessToken, {
      ...cookieBaseOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', refreshToken, {
      ...cookieBaseOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { message: 'Signup successful' };
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.login(dto);
    const rememberMe = dto.rememberMe === true;

    res.cookie('access_token', accessToken, {
      ...cookieBaseOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', refreshToken, {
      ...cookieBaseOptions,
      ...(rememberMe && {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      }),
    });

    console.log('Login successful');

    return { message: 'Login successful' };
  }

  // STEP 1: redirect to Google
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Google handles this
  }

  // STEP 2: Google callback
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req, @Res() res: Response) {
    const { accessToken, refreshToken, user } =
      await this.authService.googleLogin(req.user);

    res.cookie('access_token', accessToken, {
      ...cookieBaseOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', refreshToken, {
      ...cookieBaseOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const baseUrl =
      process.env.FRONTEND_URL ||
      (isProd ? 'https://anchorapp.feeltiptop.com' : 'http://localhost:3014');

    const redirectUrl = user.onboardingCompleted
      ? `${baseUrl}/dashboard`
      : `${baseUrl}/steps`;

    return res.redirect(redirectUrl);
  }

  // if email already exist then we will show that email already exist in th esignup page without even waiting for the user to submit the form
  @Get('check-email')
  async checkEmail(@Query('email') email: string) {
    return this.authService.checkEmailExists(email);
  }

  // email reset password
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  // reset password
  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; password: string }) {
    return this.authService.resetPassword(body.token, body.password);
  }
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = (req as any).cookies?.['refresh_token'];
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token');
    }

    const { accessToken } =
      await this.authService.refreshAccessToken(refreshToken);

    res.cookie('access_token', accessToken, {
      ...cookieBaseOptions,
      maxAge: 15 * 60 * 1000,
    });

    return { message: 'Token refreshed' };
  }

  @Post('logout')
  async logOut(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', cookieBaseOptions);
    res.clearCookie('refresh_token', cookieBaseOptions);

    return { message: 'Logged out successfully' };
  }
}
