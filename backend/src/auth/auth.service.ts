import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { comparePasswords, hashPassword } from './password.util';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  private issueTokens(user: User) {
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  private otpHash(email: string, otp: string, purpose: string) {
    return crypto
      .createHash('sha256')
      .update(
        `${purpose}:${email.toLowerCase()}:${otp}:${process.env.JWT_ACCESS_SECRET}`,
      )
      .digest('hex');
  }

  private async issueEmailOtp(
    user: User,
    destination: string,
    purpose:
      | 'signup'
      | 'email_change'
      | 'password_change'
      | 'password_reset',
  ) {
    if (
      user.emailOtpSentAt &&
      Date.now() - user.emailOtpSentAt.getTime() < 60_000
    ) {
      throw new BadRequestException(
        'Please wait before requesting another code',
      );
    }
    const otp = crypto.randomInt(100000, 1000000).toString();
    user.emailOtpHash = this.otpHash(destination, otp, purpose);
    user.emailOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    user.emailOtpAttempts = 0;
    user.emailOtpPurpose = purpose;
    await this.userRepo.save(user);
    await this.mailService.sendEmailOtp(destination, otp, purpose);
    user.emailOtpSentAt = new Date();
    await this.userRepo.save(user);
  }

  private clearOtp(user: User) {
    user.emailOtpHash = null;
    user.emailOtpExpiresAt = null;
    user.emailOtpSentAt = null;
    user.emailOtpAttempts = 0;
    user.emailOtpPurpose = null;
  }

  private async verifyOtp(
    user: User,
    email: string,
    otp: string,
    purpose:
      | 'signup'
      | 'email_change'
      | 'password_change'
      | 'password_reset',
  ) {
    if (
      user.emailOtpPurpose !== purpose ||
      !user.emailOtpHash ||
      !user.emailOtpExpiresAt ||
      user.emailOtpExpiresAt.getTime() < Date.now()
    ) {
      throw new BadRequestException('Verification code is invalid or expired');
    }
    if (user.emailOtpAttempts >= 5) {
      throw new BadRequestException(
        'Too many incorrect attempts. Request a new code',
      );
    }
    if (this.otpHash(email, otp, purpose) !== user.emailOtpHash) {
      user.emailOtpAttempts += 1;
      await this.userRepo.save(user);
      throw new BadRequestException('Incorrect verification code');
    }
    this.clearOtp(user);
  }

  async signup(dto: SignupDto) {
    const existingUser = await this.userRepo.findOne({
      where: { email: dto.email },
    });

    if (existingUser?.emailVerified) {
      throw new ConflictException('User already exists');
    }

    // 1️⃣ Hash the password
    const hashedPassword = await hashPassword(dto.password);

    const user = existingUser ?? this.userRepo.create();
    user.name = dto.name;
    user.email = dto.email.toLowerCase();
    user.password = hashedPassword;
    user.provider = 'local';
    user.emailVerified = false;

    await this.userRepo.save(user);
    await this.issueEmailOtp(user, user.email, 'signup');
    return { email: user.email };
  }

  async verifySignupOtp(email: string, otp: string) {
    const user = await this.userRepo.findOne({
      where: { email: email.toLowerCase() },
    });
    if (!user)
      throw new BadRequestException('Verification code is invalid or expired');
    await this.verifyOtp(user, user.email, otp, 'signup');
    user.emailVerified = true;
    await this.userRepo.save(user);
    return { ...this.issueTokens(user), user };
  }

  async resendSignupOtp(email: string) {
    const user = await this.userRepo.findOne({
      where: { email: email.toLowerCase() },
    });
    if (!user || user.emailVerified)
      return { message: 'If verification is pending, a code was sent' };
    await this.issueEmailOtp(user, user.email, 'signup');
    return { message: 'Verification code sent' };
  }

  async login(dto: LoginDto) {
    // 1️⃣ Find user by email (later)
    const user = await this.userRepo.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Email not found');
    }
    if (!user.password) {
      throw new UnauthorizedException(
        'This account uses Google login. Please sign in with Google.',
      );
    }
    if (!user.emailVerified) {
      throw new UnauthorizedException('Email verification required');
    }

    // 2️⃣ Compare passwords
    const isMatch = await comparePasswords(dto.password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Incorrect Password');
    }

    // 🌍 update user timezone if provided
    if (dto.timezone && user.timezone !== dto.timezone) {
      user.timezone = dto.timezone;
      await this.userRepo.save(user);
    }
    return this.issueTokens(user);
  }

  async googleLogin(googleUser: {
    email: string;
    name: string;
    googleId: string;
  }) {
    let user = await this.userRepo.findOne({
      where: { email: googleUser.email },
    });

    // 👤 If user doesn't exist → create
    if (!user) {
      user = this.userRepo.create({
        email: googleUser.email,
        name: googleUser.name,
        provider: 'google',
        provider_id: googleUser.googleId,
        password: null,
        emailVerified: true,
      });

      await this.userRepo.save(user);
    }

    if (!user.emailVerified) {
      user.emailVerified = true;
      this.clearOtp(user);
      await this.userRepo.save(user);
    }

    const tokens = this.issueTokens(user);
    return { ...tokens, user };
  }

  async requestEmailChange(userId: string, newEmail: string) {
    const normalized = newEmail.trim().toLowerCase();
    const existing = await this.userRepo.findOne({
      where: { email: normalized },
    });
    if (existing && existing.id !== userId)
      throw new ConflictException('Email already in use');
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    if (user.email === normalized)
      throw new BadRequestException('This is already your email');
    user.pendingEmail = normalized;
    await this.issueEmailOtp(user, normalized, 'email_change');
    return { pendingEmail: normalized };
  }

  async verifyEmailChange(userId: string, otp: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user || !user.pendingEmail)
      throw new BadRequestException('No email change is pending');
    await this.verifyOtp(user, user.pendingEmail, otp, 'email_change');
    user.email = user.pendingEmail;
    user.pendingEmail = null;
    user.emailVerified = true;
    await this.userRepo.save(user);
    return { ...this.issueTokens(user), email: user.email };
  }

  private assertStrongPassword(password: string) {
    if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=]).{8,}$/.test(
        password,
      )
    ) {
      throw new BadRequestException(
        'Password must contain at least 8 characters, including uppercase, lowercase, a number, and a symbol',
      );
    }
  }

  async requestPasswordChange(userId: string, currentPassword: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    if (!user.password)
      throw new BadRequestException(
        'This account uses Google sign-in and does not have a password to change',
      );
    if (!(await comparePasswords(currentPassword, user.password)))
      throw new UnauthorizedException('Current password is incorrect');
    await this.issueEmailOtp(user, user.email, 'password_change');
    return { message: 'Verification code sent' };
  }

  async confirmPasswordChange(
    userId: string,
    currentPassword: string,
    otp: string,
    password: string,
  ) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user?.password) throw new UnauthorizedException();
    if (!(await comparePasswords(currentPassword, user.password)))
      throw new UnauthorizedException('Current password is incorrect');
    this.assertStrongPassword(password);
    if (await comparePasswords(password, user.password)) {
      throw new BadRequestException(
        'New password must be different from your current password',
      );
    }
    await this.verifyOtp(user, user.email, otp, 'password_change');
    user.password = await hashPassword(password);
    await this.userRepo.save(user);
    return { message: 'Password changed successfully' };
  }

  async requestPasswordResetOtp(email: string) {
    const normalized = email.trim().toLowerCase();
    const user = await this.userRepo.findOne({ where: { email: normalized } });
    // Do not reveal whether an account exists.
    if (user) await this.issueEmailOtp(user, user.email, 'password_reset');
    return { message: 'If the email exists, a verification code was sent' };
  }

  async confirmPasswordResetOtp(
    email: string,
    otp: string,
    password: string,
  ) {
    const normalized = email.trim().toLowerCase();
    const user = await this.userRepo.findOne({ where: { email: normalized } });
    if (!user)
      throw new BadRequestException('Verification code is invalid or expired');
    this.assertStrongPassword(password);
    if (user.password && (await comparePasswords(password, user.password))) {
      throw new BadRequestException(
        'New password must be different from your current password',
      );
    }
    await this.verifyOtp(user, user.email, otp, 'password_reset');
    user.password = await hashPassword(password);
    await this.userRepo.save(user);
    return { message: 'Password reset successful' };
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<{ sub: string }>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.userRepo.findOne({ where: { id: payload.sub } });
      if (!user) throw new UnauthorizedException('User not found');

      const newAccessToken = this.jwtService.sign(
        { sub: user.id, email: user.email },
        { expiresIn: '15m' },
      );

      return { accessToken: newAccessToken };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async checkEmailExists(email: string) {
    if (!email) {
      return { exists: false };
    }

    const user = await this.userRepo.findOne({
      where: { email },
      select: ['id', 'emailVerified'],
    });

    return { exists: Boolean(user?.emailVerified) };
  }

  // password reset will be implemented
  async forgotPassword(email: string) {
    const user = await this.userRepo.findOne({ where: { email } });

    // 🔐 Important: do NOT reveal if user exists
    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    // 1️⃣ Generate secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // 2️⃣ Hash the token before saving
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // 3️⃣ Save token + expiry
    user.passwordResetToken = hashedToken;
    user.passwordResetExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    await this.userRepo.save(user);

    // 4️⃣ Reset link (frontend URL)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3002';
    const resetLink = `${frontendUrl}/changePassword?token=${resetToken}`;
    await this.mailService.sendPasswordResetEmail(user.email, resetLink);

    return { message: 'If the email exists, a reset link was sent' };
  }

  // reset password
  async resetPassword(token: string, newPassword: string) {
    // 1️⃣ Hash the incoming token (same way we stored it)
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // 2️⃣ Find user with valid token
    const user = await this.userRepo.findOne({
      where: {
        passwordResetToken: hashedToken,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    // 3️⃣ Check token expiry
    if (
      !user.passwordResetExpiresAt ||
      user.passwordResetExpiresAt < new Date()
    ) {
      throw new UnauthorizedException('Reset token has expired');
    }

    // 4️⃣ Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // 5️⃣ Update user password + clear reset fields
    user.password = hashedPassword;
    user.passwordResetToken = null;
    user.passwordResetExpiresAt = null;

    await this.userRepo.save(user);

    return { message: 'Password reset successful' };
  }
}
