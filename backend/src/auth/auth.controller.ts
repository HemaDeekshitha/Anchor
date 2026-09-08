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
  path: '/',
  secure: isProd,
  sameSite: (isProd ? 'none' : 'lax') as 'none' | 'lax',
  ...(isProd && { domain: '.feeltiptop.com' }),
};

const SESSION_COOKIE_MS = 30 * 24 * 60 * 60 * 1000;

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    res.cookie('access_token', accessToken, {
      ...cookieBaseOptions,
      maxAge: SESSION_COOKIE_MS,
    });
    res.cookie('refresh_token', refreshToken, {
      ...cookieBaseOptions,
      maxAge: SESSION_COOKIE_MS,
    });
  }

  @Post('signup')
  async signup(@Body() dto: SignupDto) {
    const result = await this.authService.signup(dto);
    return { message: 'Verification code sent', ...result };
  }

  @Post('signup/verify-otp')
  async verifySignupOtp(
    @Body() body: { email: string; otp: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.verifySignupOtp(body.email, body.otp);
    this.setAuthCookies(res, result.accessToken, result.refreshToken);
    return { message: 'Email verified' };
  }

  @Post('signup/resend-otp')
  resendSignupOtp(@Body('email') email: string) {
    return this.authService.resendSignupOtp(email);
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.login(dto);
    this.setAuthCookies(res, accessToken, refreshToken);

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

    this.setAuthCookies(res, accessToken, refreshToken);

    const baseUrl =
      process.env.FRONTEND_URL ||
      (isProd ? 'https://anchorapp.feeltiptop.com' : 'http://localhost:3002');

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

  @Post('password/change/request')
  @UseGuards(AuthGuard('jwt'))
  requestPasswordChange(
    @Req() req: Request,
    @Body('currentPassword') currentPassword: string,
  ) {
    const userId = (req.user as { userId: string }).userId;
    return this.authService.requestPasswordChange(userId, currentPassword);
  }

  @Post('password/change/confirm')
  @UseGuards(AuthGuard('jwt'))
  confirmPasswordChange(
    @Req() req: Request,
    @Body()
    body: { currentPassword: string; otp: string; password: string },
  ) {
    const userId = (req.user as { userId: string }).userId;
    return this.authService.confirmPasswordChange(
      userId,
      body.currentPassword,
      body.otp,
      body.password,
    );
  }

  @Post('password/reset/request-otp')
  requestPasswordResetOtp(@Body('email') email: string) {
    return this.authService.requestPasswordResetOtp(email);
  }

  @Post('password/reset/confirm-otp')
  confirmPasswordResetOtp(
    @Body() body: { email: string; otp: string; password: string },
  ) {
    return this.authService.confirmPasswordResetOtp(
      body.email,
      body.otp,
      body.password,
    );
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

    const { accessToken, refreshToken: nextRefreshToken } =
      await this.authService.refreshAccessToken(refreshToken);
    this.setAuthCookies(res, accessToken, nextRefreshToken);

    return { message: 'Token refreshed' };
  }

  @Get('session')
  @UseGuards(AuthGuard('jwt'))
  getSession(@Req() req: Request) {
    const user = req.user as { userId?: string; email?: string } | undefined;
    return {
      authenticated: true,
      userId: user?.userId,
      email: user?.email,
    };
  }

  @Post('email-change/request')
  @UseGuards(AuthGuard('jwt'))
  requestEmailChange(@Req() req: Request, @Body('email') email: string) {
    const userId = (req.user as { userId: string }).userId;
    return this.authService.requestEmailChange(userId, email);
  }

  @Post('email-change/verify')
  @UseGuards(AuthGuard('jwt'))
  async verifyEmailChange(
    @Req() req: Request,
    @Body('otp') otp: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = (req.user as { userId: string }).userId;
    const result = await this.authService.verifyEmailChange(userId, otp);
    this.setAuthCookies(res, result.accessToken, result.refreshToken);
    return { message: 'Email updated', email: result.email };
  }

  @Post('logout')
  async logOut(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', cookieBaseOptions);
    res.clearCookie('refresh_token', cookieBaseOptions);

    return { message: 'Logged out successfully' };
  }
}
