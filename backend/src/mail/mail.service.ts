import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import Mailjet from 'node-mailjet';
import sgMail from '@sendgrid/mail';

@Injectable()
export class MailService {
  private mailjet: any;
  private readonly useSendGrid: boolean;

  constructor() {
    const hasMailjet = Boolean(
      process.env.MAILJET_API_KEY && process.env.MAILJET_SECRET_KEY,
    );
    this.useSendGrid = !hasMailjet && Boolean(process.env.SENDGRID_API_KEY);
    if (hasMailjet) {
      this.mailjet = Mailjet.apiConnect(
        process.env.MAILJET_API_KEY!,
        process.env.MAILJET_SECRET_KEY!,
      );
    } else if (this.useSendGrid) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
    }
  }

  private async sendEmail(to: string, subject: string, html: string) {
    if (this.useSendGrid) {
      const from = process.env.SENDGRID_FROM_EMAIL;
      if (!from)
        throw new ServiceUnavailableException('Email sender is not configured');
      const [result] = await sgMail.send({ to, from, subject, html });
      return result;
    }
    if (!this.mailjet) {
      throw new ServiceUnavailableException('Email delivery is not configured');
    }
    try {
      const result = await this.mailjet
        .post('send', { version: 'v3.1' })
        .request({
          Messages: [
            {
              From: {
                Email: process.env.MAILJET_FROM_EMAIL!, // tiptop@feeltiptop.com
                Name: process.env.MAILJET_FROM_NAME || 'TipTop',
              },
              To: [{ Email: to }],
              Subject: subject,
              HTMLPart: html,
            },
          ],
        });

      return result.body;
    } catch (err) {
      throw err;
    }
  }

  // ✅ Public method for password reset
  async sendPasswordResetEmail(to: string, resetLink: string) {
    const subject = 'Reset your password';
    const html = `
      <div style="font-family: Arial, sans-serif;">
        <h2>Reset your password</h2>
        <p>You requested a password reset. Click the button below:</p>
        <p>
          <a href="${resetLink}" 
             style="display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">
            Reset Password
          </a>
        </p>
        <p>This link expires in 15 minutes.</p>
        <p>If you didn’t request this, you can safely ignore this email.</p>
      </div>
    `;

    return this.sendEmail(to, subject, html);
  }

  async sendEmailOtp(
    to: string,
    otp: string,
    purpose:
      | 'signup'
      | 'email_change'
      | 'password_change'
      | 'password_reset',
  ) {
    const headings = {
      signup: 'Verify your Anchor account',
      email_change: 'Verify your new email',
      password_change: 'Verify your password change',
      password_reset: 'Reset your Anchor password',
    } as const;
    const heading = headings[purpose];
    return this.sendEmail(
      to,
      heading,
      `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#2c1a0a">
        <h2>${heading}</h2>
        <p>Enter this one-time verification code in Anchor:</p>
        <div style="font-size:32px;font-weight:700;letter-spacing:8px;padding:18px 22px;background:#f5ede0;border-radius:12px;text-align:center">${otp}</div>
        <p>This code expires in 10 minutes. Never share it with anyone.</p>
        <p>If you did not request this, you can ignore this email.</p>
      </div>`,
    );
  }
}
