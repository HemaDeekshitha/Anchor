import { Injectable } from '@nestjs/common';
import sgMail from '@sendgrid/mail';

@Injectable()
export class MailService {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
  }

  async sendPasswordResetEmail(to: string, resetLink: string) {
    const msg = {
      to,
      from: process.env.SENDGRID_FROM_EMAIL!, // verified sender
      subject: 'Reset your Anchor password',
      html: `
        <p>You requested a password reset.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link expires in 15 minutes.</p>
      `,
    };

    await sgMail.send(msg);
  }
}
