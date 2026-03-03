// C:\Users\nsais\Anchor\backend\src\application-tracker\application-tracker.service.ts
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GmailConnection } from './entities/gmail-connection.entity';
import { JobApplication } from './entities/job-application.entity';
import { GmailService } from './gmail.service';

@Injectable()
export class ApplicationTrackerService {
  private readonly logger = new Logger(ApplicationTrackerService.name);

  constructor(
    @InjectRepository(JobApplication)
    private jobRepo: Repository<JobApplication>,

    @InjectRepository(GmailConnection)
    private gmailRepo: Repository<GmailConnection>,

    private gmailService: GmailService
  ) {}

  async scanGmail(userId: string) {
    const scanStartedAt = process.hrtime.bigint();
    this.logger.log(`scan-start user=${userId}`);

    const connection = await this.gmailRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user']
    });

    if (!connection) {
      throw new BadRequestException('Gmail not connected');
    }

    // Refresh token if expired
    let accessToken = connection.accessToken;
    if (!connection.refreshToken) {
      throw new BadRequestException(
        'Gmail refresh token missing. Please reconnect Gmail once to restore access.'
      );
    }

    try {
      const refreshed = await this.gmailService.refreshAccessToken(
        connection.refreshToken,
        connection.tokenExpiry,
        connection.accessToken
      );

      accessToken = refreshed.accessToken;
      connection.accessToken = refreshed.accessToken;
      if (refreshed.refreshToken) {
        connection.refreshToken = refreshed.refreshToken;
      }
      if (refreshed.tokenExpiry) {
        connection.tokenExpiry = refreshed.tokenExpiry;
      }
      connection.status = 'active';
      await this.gmailRepo.save(connection);
    } catch (error) {
      connection.status = 'needs_reconnect';
      await this.gmailRepo.save(connection);
      throw new BadRequestException(
        'Gmail connection expired or revoked. Please reconnect Gmail.'
      );
    }

    const messages = await this.gmailService.fetchRecentEmails(
      accessToken,
      'newer_than:30d',
      100
    );

    const keywords = [
      'interview',
      'application',
      'applied',
      'job',
      'position',
      'opportunity',
      'offer',
      'recruiter',
      'hiring',
      'unfortunately',
      'thank you for applying',
    ];

    let processed = 0;
    let matched = 0;
    let stored = 0;

    for (const msg of messages) {
      if (!msg.id) continue;
      processed += 1;

      const fullEmail = await this.gmailService.getEmailDetails(
        accessToken,
        msg.id
      );

      const snippet = fullEmail.snippet?.toLowerCase() || '';
      const headers = fullEmail.payload?.headers || [];
      const subjectHeader = headers.find((header: any) => header.name?.toLowerCase() === 'subject');
      const fromHeader = headers.find((header: any) => header.name?.toLowerCase() === 'from');
      const subject = (subjectHeader?.value || '').toLowerCase();
      const from = (fromHeader?.value || '').toLowerCase();
      const searchableText = `${subject} ${snippet} ${from}`;

      if (keywords.some((keyword) => searchableText.includes(keyword))) {
        matched += 1;
        const wasStored = await this.processJobEmail(fullEmail, userId);
        if (wasStored) {
          stored += 1;
        }
      }
    }

    const latencyMs = Number(process.hrtime.bigint() - scanStartedAt) / 1_000_000;
    const latencyMin = latencyMs / 60_000;
    this.logger.log(
      `scan-summary user=${userId} fetched=${messages.length} processed=${processed} matched=${matched} stored=${stored} latencyMs=${latencyMs.toFixed(1)} latencyMin=${latencyMin.toFixed(2)}`,
    );

    return {
      totalFetched: messages.length,
      processed,
      matched,
      stored,
    };
  }

  async processJobEmail(email: any, userId: string) {
    const threadId = email.threadId;
    const messageId = email.id;
    const messageDate = this.extractMessageDate(email);

    const existing = await this.jobRepo.findOne({
      where: { threadId, user: { id: userId } },
      relations: ['user']
    });

    const snippetRaw = email.snippet || '';
    const snippet = snippetRaw.toLowerCase();
    const headers = email.payload?.headers || [];
    const fromHeader = headers.find((header: any) => header.name?.toLowerCase() === 'from');
    const subjectHeader = headers.find((header: any) => header.name?.toLowerCase() === 'subject');
    const sourceEmail = fromHeader?.value || '';
    const subject = subjectHeader?.value || '';

    const company = this.extractCompany(subject, sourceEmail);
    const role = this.extractRole(subject, snippetRaw);

    let status = 'Applied';
    const statusText = `${subject.toLowerCase()} ${snippet}`;

    if (statusText.includes('interview')) status = 'Interview';
    if (statusText.includes('offer')) status = 'Offer';
    if (statusText.includes('unfortunately') || statusText.includes('regret to inform')) status = 'Rejected';

    if (existing) {
      existing.status = status;
      existing.lastMessageId = messageId;
      existing.sourceEmail = sourceEmail;
      if (!existing.appliedDate && messageDate) {
        existing.appliedDate = messageDate;
      }
      if (
        (!existing.company || existing.company === 'Unknown Company') &&
        company !== 'Unknown Company'
      ) {
        existing.company = company;
      }
      if (
        (!existing.role || existing.role === 'Unknown Role') &&
        role !== 'Unknown Role'
      ) {
        existing.role = role;
      }
      await this.jobRepo.save(existing);
      return true;
    } else {
      const job = this.jobRepo.create({
        user: { id: userId },
        company,
        role,
        status,
        threadId,
        lastMessageId: messageId,
        sourceEmail,
        appliedDate: messageDate || new Date()
      });

      await this.jobRepo.save(job);
      return true;
    }
  }

  private extractCompany(subject: string, from: string): string {
    const companyInSubject = subject.match(/(?:at|with)\s+([A-Z][A-Za-z0-9&.\- ]{1,50})/i)?.[1]?.trim();
    if (companyInSubject) {
      return companyInSubject;
    }

    const fromName = from.split('<')[0]?.replace(/"/g, '').trim();
    if (fromName && !fromName.includes('@') && fromName.length > 1 && fromName.length < 50) {
      return fromName;
    }

    const emailMatch = from.match(/<?[A-Z0-9._%+-]+@([A-Z0-9.-]+\.[A-Z]{2,})>?/i);
    const domain = emailMatch?.[1]?.toLowerCase() || '';
    const domainRoot = domain.split('.')[0];
    const ignoredRoots = new Set([
      'gmail',
      'yahoo',
      'outlook',
      'hotmail',
      'google',
      'mail',
      'linkedin',
      'greenhouse',
      'lever',
      'workday',
    ]);

    if (domainRoot && !ignoredRoots.has(domainRoot)) {
      return domainRoot.charAt(0).toUpperCase() + domainRoot.slice(1);
    }

    return 'Unknown Company';
  }

  private extractRole(subject: string, snippet: string): string {
    const text = `${subject} ${snippet}`;
    const rolePatterns = [
      /(?:application|applied)\s+for\s+([^.,;\n]+)/i,
      /(?:interview|offer)\s+for\s+([^.,;\n]+)/i,
      /(?:position|role)\s+(?:of\s+)?([^.,;\n]+)/i,
      /as\s+(?:a|an)?\s*([^.,;\n]+)/i,
    ];

    for (const pattern of rolePatterns) {
      const match = text.match(pattern)?.[1]?.trim();
      if (match) {
        return match.replace(/\s+at\s+.+$/i, '').trim();
      }
    }

    return 'Unknown Role';
  }

  private extractMessageDate(email: any): Date | null {
    const internalDateRaw = email?.internalDate;
    if (internalDateRaw) {
      const internalDateMs = Number(internalDateRaw);
      if (!Number.isNaN(internalDateMs) && internalDateMs > 0) {
        return new Date(internalDateMs);
      }
    }

    const headers = email?.payload?.headers || [];
    const dateHeader = headers.find(
      (header: any) => header.name?.toLowerCase() === 'date'
    );
    if (dateHeader?.value) {
      const parsed = new Date(dateHeader.value);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }

    return null;
  }

  async getJobsForUser(userId: string) {
    return this.jobRepo.find({
      where: { user: { id: userId } },
      order: { appliedDate: 'DESC' },
      relations: ['user'],
    });
  }
}