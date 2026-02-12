import {
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
  async signup(dto: SignupDto) {
    const existingUser = await this.userRepo.findOne({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    // 1️⃣ Hash the password
    const hashedPassword = await hashPassword(dto.password);

    const user = this.userRepo.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
    });

    await this.userRepo.save(user);

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      },
    );

    return { accessToken, refreshToken };
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

    // 2️⃣ Compare passwords
    const isMatch = await comparePasswords(dto.password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Incorrect Password');
    }
    const payload = { sub: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    // ✅ Service returns DATA only
    return { accessToken, refreshToken };
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
      });

      await this.userRepo.save(user);
    }

    // 🔐 Generate JWTs (reuse your existing logic)
    const accessToken = this.jwtService.sign(
      { sub: user.id, email: user.email },
      { expiresIn: '15m' },
    );

    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      { expiresIn: '7d' },
    );

    return { accessToken, refreshToken, user };
  }

  async checkEmailExists(email: string) {
    if (!email) {
      return { exists: false };
    }

    const user = await this.userRepo.findOne({
      where: { email },
      select: ['id'], // 👈 lightweight query
    });

    return { exists: !!user };
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
    const resetLink = `http://localhost:3000/changePassword?token=${resetToken}`;
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
