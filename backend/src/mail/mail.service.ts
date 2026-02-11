import { Injectable } from '@nestjs/common';
import Mailjet from 'node-mailjet';

@Injectable()
export class MailService {
  private mailjet: any;

  constructor() {
    this.mailjet = Mailjet.apiConnect(
      process.env.MAILJET_API_KEY!,
      process.env.MAILJET_SECRET_KEY!,
    );
  }

  private async sendEmail(to: string, subject: string, html: string) {
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

      console.log('✅ Mailjet Response:', result.body);
      return result.body;
    } catch (err) {
      console.error('❌ Mailjet Error:', err);
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
}
