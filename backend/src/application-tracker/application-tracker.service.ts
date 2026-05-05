import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GmailConnection } from './entities/gmail-connection.entity';
import { JobApplication } from './entities/job-application.entity';
import { GmailService } from './gmail.service';
import { ManualJobDto } from './dto/manual-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface ParsedJob {
  company: string;
  role: string;
  status?: string;
}

@Injectable()
export class ApplicationTrackerService {
  private readonly logger = new Logger(ApplicationTrackerService.name);

  // Higher = higher priority. Status only ever moves UP this scale.
  private readonly STATUS_PRIORITY: Record<string, number> = {
    Applied: 1,
    Interview: 2,
    Offer: 3,
    Rejected: 4,
  };

  constructor(
    @InjectRepository(JobApplication)
    private jobRepo: Repository<JobApplication>,

    @InjectRepository(GmailConnection)
    private gmailRepo: Repository<GmailConnection>,

    private gmailService: GmailService
  ) {}

  // ─── Main scan ──────────────────────────────────────────────────────────────

  async scanGmail(userId: string) {
    const scanStartedAt = process.hrtime.bigint();
    this.logger.log(`scan-start user=${userId}`);

    const connection = await this.gmailRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    if (!connection) throw new BadRequestException('Gmail not connected');
    if (!connection.refreshToken) {
      throw new BadRequestException(
        'Gmail refresh token missing. Please reconnect Gmail.'
      );
    }

    // Refresh token if needed
    let accessToken = connection.accessToken;
    try {
      const refreshed = await this.gmailService.refreshAccessToken(
        connection.refreshToken,
        connection.tokenExpiry,
        connection.accessToken
      );
      accessToken = refreshed.accessToken;
      connection.accessToken = refreshed.accessToken;
      if (refreshed.refreshToken) connection.refreshToken = refreshed.refreshToken;
      if (refreshed.tokenExpiry) connection.tokenExpiry = refreshed.tokenExpiry;
      connection.status = 'active';
      await this.gmailRepo.save(connection);
    } catch {
      connection.status = 'needs_reconnect';
      await this.gmailRepo.save(connection);
      throw new BadRequestException(
        'Gmail connection expired or revoked. Please reconnect Gmail.'
      );
    }

    // Gmail search query — targeted at job email subjects and known ATS senders
    const searchQuery = [
      // Application confirmation subjects
      'subject:("your application")',
      'subject:("application received")',
      'subject:("thank you for applying")',
      'subject:("thank you for your interest")',
      'subject:("thank you for your application")',
      'subject:("we received your application")',
      'subject:("application for")',
      'subject:("applied for")',
      'subject:("update on your application")',
      'subject:("decision on your application")',
      'subject:("regarding your application")',
      'subject:("your interest in")',
      'subject:("your application status")',
      'subject:("your candidacy")',
      // Generic "Thank you from [Company]" — e.g. NVIDIA, Apple
      'subject:("thank you from")',
      // "We have reviewed…" — common rejection opening
      'subject:("we have reviewed")',
      // Interview subjects
      'subject:("interview invitation")',
      'subject:("interview request")',
      'subject:("interview scheduled")',
      'subject:("next steps")',
      'subject:("interview")',
      'subject:("move forward")',
      'subject:("assessment")',
      'subject:("coding challenge")',
      'subject:("take-home")',
      // Offer / Rejection subjects
      'subject:("job offer")',
      'subject:("offer letter")',
      'subject:("we regret")',
      'subject:("unfortunately")',
      'subject:("after careful consideration")',
      'subject:("we have decided")',
      'subject:("not selected")',
      'subject:("our decision")',
      'subject:("moving forward")',
      // Role title subjects
      'subject:("software engineer")',
      'subject:("software developer")',
      'subject:("product manager")',
      'subject:("data engineer")',
      'subject:("data scientist")',
      'subject:("data analyst")',
      'subject:("business analyst")',
      'subject:("full stack")',
      'subject:("frontend developer")',
      'subject:("backend developer")',
      'subject:("devops engineer")',
      'subject:("marketing manager")',
      'subject:("account manager")',
      'subject:("ux designer")',
      'subject:("product designer")',
      'subject:("technical recruiter")',
      'subject:("program manager")',
      'subject:("project manager")',
      'subject:("machine learning")',
      'subject:("cloud engineer")',
      'subject:("site reliability")',
      // ATS / recruiting platform senders
      'from:(greenhouse.io)',
      'from:(lever.co)',
      'from:(myworkdayjobs.com)',
      // myworkday.com is used by individual companies (e.g. nvidia@myworkday.com)
      'from:(myworkday.com)',
      'from:(taleo.net)',
      'from:(icims.com)',
      'from:(jobvite.com)',
      'from:(smartrecruiters.com)',
      'from:(successfactors.com)',
      'from:(brassring.com)',
      'from:(ripplematchweb.com)',
      'from:(ashbyhq.com)',
      'from:(recruitics.com)',
      'from:(phenom.com)',
      // Direct company career domains
      'from:(careers.microsoft.com)',
      'from:(email.careers.microsoft.com)',
      'from:(amazon.jobs)',
      'from:(google.com)',
      'from:(linkedin.com)',
      'from:(workday.com)',
      'from:(oracle.com)',
      'from:(salesforce.com)',
      'from:(meta.com)',
      'from:(apple.com)',
      'from:(nvidia.com)',
      'from:(uber.com)',
      'from:(stripe.com)',
      'from:(airbnb.com)',
      'from:(netflix.com)',
      'from:(bytedance.com)',
      'from:(openai.com)',
      'from:(anthropic.com)',
    ].join(' OR ');

    // Walk Gmail messages newest-first (up to 6 months back).
    // Stop as soon as 50 job applications have been stored, or all messages
    // within the window are exhausted.  Each API page fetches 100 messages;
    // we process threads de-duplicated across pages so no thread is parsed twice.
    const TARGET_STORED = 50;
    const PAGE_SIZE = 100;
    const MAX_PAGES = 5; // hard ceiling: 500 messages scanned at most

    const seenThreadIds = new Set<string>();
    let pageToken: string | undefined;
    let pagesScanned = 0;
    let totalEmailsFetched = 0;

    let processed = 0;
    let stored = 0;
    let skipped = 0;
    let aiRateLimited = false;

    scanLoop:
    do {
      pagesScanned++;
      const { messages, nextPageToken } = await this.gmailService.fetchRecentEmails(
        accessToken,
        `(${searchQuery}) newer_than:180d`,
        PAGE_SIZE,
        pageToken,
      );
      pageToken = nextPageToken;
      totalEmailsFetched += messages.length;

      if (messages.length === 0) break;

      this.logger.log(
        `scan-page user=${userId} page=${pagesScanned} messages=${messages.length} storedSoFar=${stored}`,
      );

      // Collect unique thread IDs introduced by this page (messages sorted newest-first)
      const pageThreadIds: string[] = [];
      for (const msg of messages) {
        if (msg.threadId && !seenThreadIds.has(msg.threadId)) {
          seenThreadIds.add(msg.threadId);
          pageThreadIds.push(msg.threadId);
        }
      }

      // Process each new thread
      for (const threadId of pageThreadIds) {
        processed += 1;

        const threadData = await this.gmailService.getThreadDetails(accessToken, threadId);
        const msgs = threadData.messages || [];
        if (msgs.length === 0) continue;

        // Messages are oldest-first — first message is the initial application email
        const firstMsg = msgs[0];
        const firstHeaders = firstMsg.payload?.headers || [];
        const subject = this.getHeader(firstHeaders, 'subject');
        const from = this.getHeader(firstHeaders, 'from');
        const body = this.gmailService.decodeEmailBody(firstMsg.payload);

        // Content filter — skip non-job emails that slipped through
        if (!this.isJobRelatedEmail(subject, body, from)) {
          skipped += 1;
          continue;
        }

        // Parse company + role (ATS-specific first, then generic body)
        let { company, role } = this.parseEmail(subject, from, body);

        // AI fallback — only called when regex left at least one field unknown
        let aiStatus: string | undefined;
        if (!aiRateLimited && (company === 'Unknown Company' || role === 'Unknown Role')) {
          try {
            const aiResult = await this.extractWithAI(subject, from, body);
            if (company === 'Unknown Company' && aiResult.company !== 'Unknown Company') company = aiResult.company;
            if (role === 'Unknown Role' && aiResult.role !== 'Unknown Role') role = aiResult.role;
            if (aiResult.status) aiStatus = aiResult.status;
          } catch (err) {
            const errMsg = String(err);
            if (/429|rate.?limit|quota.?exceeded|resource.?exhausted/i.test(errMsg)) {
              aiRateLimited = true;
              this.logger.warn(`gemini-rate-limited — AI fallback disabled for remainder of scan`);
            } else {
              this.logger.warn(`ai-fallback-failed thread=${threadId}: ${errMsg}`);
            }
          }
        }

        // Confidence threshold — skip if even AI couldn't extract anything useful
        if (company === 'Unknown Company' && role === 'Unknown Role') {
          this.logger.debug(`skip-low-confidence thread=${threadId} subject="${subject}"`);
          skipped += 1;
          continue;
        }

        // Determine final status from ALL messages in thread (highest priority wins)
        let finalStatus = aiStatus ?? 'Applied';
        for (const msg of msgs) {
          const msgHeaders = msg.payload?.headers || [];
          const msgSubject = this.getHeader(msgHeaders, 'subject');
          const msgBody = this.gmailService.decodeEmailBody(msg.payload);
          const msgStatus = this.detectStatus(msgSubject, msgBody);
          if ((this.STATUS_PRIORITY[msgStatus] ?? 0) > (this.STATUS_PRIORITY[finalStatus] ?? 0)) {
            finalStatus = msgStatus;
          }
        }

        const appliedDate = this.extractMessageDate(firstMsg);

        await this.upsertJob({
          userId,
          threadId,
          lastMessageId: msgs[msgs.length - 1].id ?? '',
          sourceEmail: from,
          company,
          role,
          status: finalStatus,
          appliedDate: appliedDate || new Date(),
        });

        stored += 1;

        // Stop once we've stored 50 applications
        if (stored >= TARGET_STORED) break scanLoop;
      }
    } while (pageToken && pagesScanned < MAX_PAGES);

    const latencyMs = Number(process.hrtime.bigint() - scanStartedAt) / 1_000_000;
    this.logger.log(
      `scan-summary user=${userId} emailsFetched=${totalEmailsFetched} pages=${pagesScanned} uniqueThreads=${seenThreadIds.size} processed=${processed} stored=${stored} skipped=${skipped} latencyMs=${latencyMs.toFixed(1)}`
    );

    return { totalFetched: totalEmailsFetched, processed, stored, skipped };
  }

  // ─── Email parsing: routes to ATS-specific or generic ───────────────────────

  private parseEmail(subject: string, from: string, body: string): ParsedJob {
    const fromLower = from.toLowerCase();

    // Workday — company lives in the sender subdomain
    if (fromLower.includes('myworkdayjobs.com') || fromLower.includes('workday.com')) {
      return this.parseWorkday(from, subject, body);
    }

    // Greenhouse
    if (fromLower.includes('greenhouse.io')) {
      return this.parseGreenhouse(subject, body);
    }

    // Lever
    if (fromLower.includes('lever.co')) {
      return this.parseLever(subject, body);
    }

    // Ashby
    if (fromLower.includes('ashbyhq.com') || fromLower.includes('ashby.io')) {
      return this.parseAshby(subject, body);
    }

    // Jobvite
    if (fromLower.includes('jobvite.com')) {
      return this.parseJobvite(subject, body);
    }

    // iCIMS, SmartRecruiters, Taleo, Brassring, Successfactors, RippleMatch
    // → all use generic body-based extraction
    return this.parseGeneric(subject, from, body);
  }

  // ─── ATS-specific parsers ────────────────────────────────────────────────────

  /**
   * Workday: company is encoded in the sender subdomain.
   * e.g. noreply@microsoft.wd1.myworkdayjobs.com → "Microsoft"
   *      noreply@google.myworkdayjobs.com         → "Google"
   */
  private parseWorkday(from: string, subject: string, body: string): ParsedJob {
    let company = 'Unknown Company';

    // Format 1: noreply@microsoft.wd1.myworkdayjobs.com — company in subdomain
    const subdomainMatch = from.match(/@([a-z0-9-]+?)(?:\.wd\d+)?\.myworkdayjobs\.com/i);
    if (subdomainMatch) {
      const raw = subdomainMatch[1]
        .replace(/-/g, ' ')
        .replace(/careers?$/i, '')
        .replace(/jobs?$/i, '')
        .replace(/hiring$/i, '')
        .replace(/apply$/i, '')
        .trim();
      if (raw.length > 0) {
        company = raw.charAt(0).toUpperCase() + raw.slice(1);
      }
    }

    // Format 2: cadence@myworkday.com — company is the local-part (before @)
    if (company === 'Unknown Company') {
      const localPartMatch = from.match(/\b([a-z0-9][a-z0-9-]{1,30})@myworkday\.com/i);
      if (localPartMatch) {
        const localPart = localPartMatch[1].toLowerCase();
        const skipLocal = new Set([
          'noreply', 'no_reply', 'donotreply', 'notifications',
          'workday', 'info', 'reply', 'recruiting', 'talent', 'careers', 'jobs',
        ]);
        if (!skipLocal.has(localPart)) {
          company = localPart.charAt(0).toUpperCase() + localPart.slice(1).replace(/-/g, ' ');
        }
      }
    }

    const role = this.extractRoleFromText(`${subject}\n${body}`);
    return { company, role };
  }

  /**
   * Greenhouse: company is in the subject prefix or body.
   * Common subjects:
   *   "[Company] - Application Received"
   *   "Application for [Role] at [Company]"
   *   "Thank you for applying to [Company]"
   */
  private parseGreenhouse(subject: string, body: string): ParsedJob {
    const fullText = `${subject}\n${body}`;
    let company = 'Unknown Company';

    // "[Company] - Application..." or "[Company]: Application..."
    const prefixMatch = subject.match(
      /^([^-:–\n]{2,50}?)\s*[-:–]\s*(?:application|your application|thank you|we received)/i
    );
    if (prefixMatch) {
      const candidate = prefixMatch[1].trim();
      if (!/(thank|apply|we |our |your )/i.test(candidate)) {
        company = this.cleanCompanyName(candidate);
      }
    }

    // "applying to [Company]" or "interest in [Company]" or "at [Company]"
    if (company === 'Unknown Company') {
      const bodyMatch = fullText.match(
        /(?:applying\s+to|applied\s+to|interest\s+in|on\s+behalf\s+of)\s+([A-Z][A-Za-z0-9&\- ]{1,50}?)(?:\s+for\b|\s*[,.]|\n)/i
      );
      if (bodyMatch) company = this.cleanCompanyName(bodyMatch[1]);
    }

    if (company === 'Unknown Company') {
      company = this.extractCompanyFromText(fullText);
    }

    const role = this.extractRoleFromText(fullText);
    return { company, role };
  }

  /**
   * Lever: subject is usually "[Company] - [Role]" or "[Company]: [phrase]"
   */
  private parseLever(subject: string, body: string): ParsedJob {
    const fullText = `${subject}\n${body}`;
    let company = 'Unknown Company';
    let role = 'Unknown Role';

    // "[Company] - [Role]" format
    const dashMatch = subject.match(/^([^-–\n]{2,50}?)\s*[-–]\s*(.+)/);
    if (dashMatch) {
      const leftSide = dashMatch[1].trim();
      const rightSide = dashMatch[2].trim();
      if (!/(thank|application|apply|we |our |your )/i.test(leftSide)) {
        company = this.cleanCompanyName(leftSide);
        if (this.isValidJobTitle(rightSide)) {
          role = rightSide;
        }
      }
    }

    if (role === 'Unknown Role') role = this.extractRoleFromText(fullText);
    if (company === 'Unknown Company') company = this.extractCompanyFromText(fullText);

    return { company, role };
  }

  /**
   * Ashby: "Application Confirmation - [Role] at [Company]"
   */
  private parseAshby(subject: string, body: string): ParsedJob {
    const fullText = `${subject}\n${body}`;

    const confirmMatch = subject.match(
      /Application\s+(?:Confirmation|Received)\s*[-–]\s*(.+?)\s+at\s+(.+)/i
    );
    if (confirmMatch) {
      const rawRole = confirmMatch[1].trim();
      return {
        role: this.isValidJobTitle(rawRole) ? rawRole : this.extractRoleFromText(fullText),
        company: this.cleanCompanyName(confirmMatch[2].trim()),
      };
    }

    return {
      company: this.extractCompanyFromText(fullText),
      role: this.extractRoleFromText(fullText),
    };
  }

  /**
   * Jobvite: "Thank you for applying to [Company] for [Role]"
   */
  private parseJobvite(subject: string, body: string): ParsedJob {
    const fullText = `${subject}\n${body}`;

    const match = fullText.match(
      /applying\s+to\s+([A-Z][A-Za-z0-9&\- ]{1,50}?)\s+for\s+(?:the\s+)?([^.\n]{4,60}?)\s*(?:position|role|job|\.|$)/i
    );
    if (match) {
      const rawRole = match[2].trim();
      return {
        company: this.cleanCompanyName(match[1]),
        role: this.isValidJobTitle(rawRole) ? rawRole : this.extractRoleFromText(fullText),
      };
    }

    return {
      company: this.extractCompanyFromText(fullText),
      role: this.extractRoleFromText(fullText),
    };
  }

  /**
   * Generic parser — used for direct company emails, iCIMS, SmartRecruiters,
   * Taleo, Brassring, Successfactors, RippleMatch, and anything else.
   */
  private parseGeneric(subject: string, from: string, body: string): ParsedJob {
    const fullText = `${subject}\n${body}`;

    const company = this.extractCompanyFromText(fullText) !== 'Unknown Company'
      ? this.extractCompanyFromText(fullText)
      : this.extractCompanyFromSender(from);

    const role = this.extractRoleFromText(fullText);
    return { company, role };
  }

  // ─── Entity extraction (body-aware) ─────────────────────────────────────────

  /**
   * Extract company name from full email text (subject + body).
   * Patterns ordered by specificity / reliability.
   * NOTE: capture groups intentionally exclude `.` and `,` to prevent
   *       sentence fragments bleeding into the company name.
   */
  private extractCompanyFromText(text: string): string {
    const patterns = [
      // "Thank you for applying to [Company]" — subject-style with ! terminator
      /\bthank\s+you\s+for\s+applying\s+to\s+([A-Z][A-Za-z0-9&\- ]{1,50?})(?:\s+for\b|\s*[,.!]|\n|$)/i,
      // "applying to [Company] for/,/./!"
      /\bappl(?:ying|ied|ication)\s+(?:to|with)\s+([A-Z][A-Za-z0-9&\- ]{1,50}?)(?:\s+for\b|\s*[,.!]|\n)/i,
      // "your interest in [Company]"
      /\binterest\s+in\s+([A-Z][A-Za-z0-9&\- ]{1,50}?)(?:\s+for\b|\s*[,.]|\n)/i,
      // "on behalf of [Company]"
      /\bon\s+behalf\s+of\s+([A-Z][A-Za-z0-9&\- ]{1,50}?)(?:\s*[,.]|\n)/i,
      // "at [Company]." (end of sentence — period/comma terminates the capture)
      /\bat\s+([A-Z][A-Za-z0-9&\- ]{1,50}?)\s*[.,\n]/i,
      // "[Company] Recruiting/Talent/Careers/HR Team"
      /([A-Z][A-Za-z0-9&\- ]{1,40}?)\s+(?:Recruiting\s+Team|Talent\s+Team|Careers\s+Team|HR\s+Team)/i,
    ];

    for (const pattern of patterns) {
      let match = text.match(pattern)?.[1]?.trim();
      if (!match || match.length <= 1 || match.length >= 60) continue;

      // If the match contains " and [lowercase/gerund]", trim at the conjunction.
      // e.g. "Coursera and applying" → "Coursera"
      match = match.replace(/\s+and\s+[a-z].*/i, '').trim();
      if (!match || match.length <= 1) continue;

      // If the match contains " at [Capital]", extract just the company after " at ".
      // e.g. "other roles at Anthropic" → try "Anthropic" directly
      const atIdx = match.search(/\s+at\s+[A-Z]/i);
      if (atIdx !== -1) {
        const afterAt = match.slice(atIdx).replace(/^\s+at\s+/i, '').trim();
        if (afterAt.length > 1) match = afterAt;
      }

      // Reject if the capture starts with a sentence fragment / verb / adjective indicator
      if (/^(the|this|a\s|an\s|your|our|we|following|steps|time|please|thank|apply|applying|joining|welcome|regarding|visiting|check|browse|explore|by\b|here|there|above|below|any|some|all|each|every|no\b|other|more|further|additional|similar|different|various|future|open|current|available|discussing|considering|reviewing|evaluating|moving|proceeding|interested|expressing|thinking|looking|seeking|exploring|finding|making)/i.test(match)) continue;

      // Reject if match contains " position" or " role" inside — it's a title, not a company name
      if (/\b(position|role|roles|opportunity|opportunities|opening)\b/i.test(match)) continue;

      // Reject if it contains words that only appear inside sentences, not company names
      const fnWords = (match.match(/\b(which|will|would|have|has|been|was|is|are|were|do|does|did|can|may|visiting|browsing|checking|exploring|clicking|updating|completing|by\s+visiting)\b/gi) || []).length;
      if (fnWords >= 1) continue;
      // Reject if it contains " by " or " and " followed by a verb (sentence pattern)
      if (/\s+by\s+[a-z]+ing\b/i.test(match)) continue;

      const cleaned = this.cleanCompanyName(match);
      if (cleaned.length > 1) return cleaned;
    }

    return 'Unknown Company';
  }

  /**
   * Fallback company extraction from the From header.
   */
  private extractCompanyFromSender(from: string): string {
    // Display name e.g. "Stripe Recruiting <jobs@stripe.com>"
    const displayName = from.split('<')[0].replace(/"/g, '').trim();
    if (displayName && !displayName.includes('@') && displayName.length >= 2 && displayName.length <= 60) {
      // Reject obvious sentence fragments used as email display names
      const isFragment =
        /^(joining|welcome|thanks|thank|please|following|apply|applying|regarding|re:|fw:|we |you |our |your )/i.test(displayName) ||
        /[.!?]/.test(displayName.slice(0, -1)); // punctuation before the end

      // Skip personal names like "Courtni Chapin" or "John Smith" — fall through
      // to domain extraction so the actual company (e.g. "Apple") is returned instead.
      // A personal name is 2–3 title-case words with no company-indicator keywords.
      const isPersonalName =
        /^[A-Z][a-z]{1,25}(\s+[A-Z][a-z]{1,25}){1,2}$/.test(displayName) &&
        !/\b(inc|llc|corp|ltd|team|hr|recruiting|talent|careers|ai|labs|technologies|systems|solutions|group|global|international|university|college|foundation|institute|agency|consulting|partners|ventures|capital|studio|studios|works|digital|media|health|care|bank|financial|insurance|logistics|software|hardware|cloud|data|network|security|analytics|research|science|bio|pharma|medical|legal|law|education|management|services|staffing)\b/i.test(displayName);

      if (!isFragment && !isPersonalName) {
        const cleaned = this.cleanCompanyName(displayName);
        if (cleaned.length > 1) return cleaned;
      }
    }

    // Domain e.g. "jobs@stripe.com" → "Stripe"
    const domainMatch = from.match(/@([A-Za-z0-9.-]+\.[A-Za-z]{2,})/i);
    if (domainMatch) {
      const parts = domainMatch[1].toLowerCase().split('.');
      const skipLabels = new Set([
        'careers', 'mail', 'jobs', 'recruiting', 'talent', 'hr', 'noreply',
        'no-reply', 'donotreply', 'notifications', 'info', 'team', 'auto',
        'bounce', 'reply', 'mailer', 'alerts', 'apply',
      ]);
      const skipRoots = new Set([
        'gmail', 'yahoo', 'outlook', 'hotmail', 'google', 'mail', 'linkedin',
        'greenhouse', 'lever', 'workday', 'taleo', 'icims', 'jobvite',
        'smartrecruiters', 'myworkdayjobs', 'myworkday', 'successfactors', 'brassring',
        'ripplematchweb', 'ashbyhq',
      ]);
      const meaningful = parts.find(
        (p) => p.length > 2 && !skipLabels.has(p) && !skipRoots.has(p)
      );
      if (meaningful) {
        return meaningful.charAt(0).toUpperCase() + meaningful.slice(1);
      }
    }

    return 'Unknown Company';
  }

  /**
   * Extract job title from full email text (subject + body).
   * Every extracted candidate is validated through isValidJobTitle() before
   * being returned — this prevents sentence fragments from being stored.
   */
  private extractRoleFromText(text: string): string {
    const patterns = [
      // "apply/applying/applied/application for [the] [optional tracking ID] [Role] position/role/job"
      // Covers infinitive ("apply for the R161061 Software Development Engineer role"),
      // gerund ("applying for the …"), past ("applied for the …"), and noun ("application for …").
      /\bappl(?:y(?:ing)?|ied|ication)\s+for\s+(?:the\s+)?(?:[A-Z]{1,4}[0-9]{3,}[-\s]+)?([A-Za-z][^,.\n@]{3,59}?)\s+(?:position|role|job|opening|opportunity)\b/i,
      // "apply/applying for [Role] at Company"
      /\bappl(?:y(?:ing)?|ied|ication)\s+for\s+(?:the\s+)?([^,.\n@]{4,60}?)(?:\s+at\s+[A-Z]|\s*[,.])/i,
      // "interview for [the] [Role]"
      /\binterview\s+for\s+(?:the\s+)?([^,.\n@]{4,60}?)(?:\s+(?:position|role|at)\b|\s*[,.])/i,
      // "offer for [the] [Role]"
      /\boffer\s+for\s+(?:the\s+)?([^,.\n@]{4,60}?)(?:\s+(?:position|role|at)\b|\s*[,.])/i,
      // "[Role] position at ..."
      /([^,.\n@]{4,60}?)\s+position\s+at\b/i,
      // "position of [Role]"
      /\bposition\s+of\s+([^,.\n@]{4,60}?)(?:\s+at\s+|\s*[,.]|\s*$)/i,
      // "the [Role] role"
      /\bthe\s+([^,.\n@]{4,60}?)\s+role\b/i,
      // Standalone job title keyword pattern — most reliable, used as final fallback
      /((?:(?:senior|sr\.?|junior|jr\.?|lead|principal|staff|mid.?level|entry.?level|associate|founding|executive|head\s+of)\s+)?(?:software|frontend|back.?end|full.?stack|data|machine\s+learning|ml|ai|devops|cloud|mobile|ios|android|product|project|program|engineering|qa|quality\s+assurance|test|security|platform|site\s+reliability|sre|solutions|ui|ux|embedded|firmware|hardware|network|infrastructure|systems|cybersecurity|game|robotics|marketing|sales|finance|legal|operations|business|content|technical|human\s+resources|hr|customer\s+success|customer\s+support|graphic|supply\s+chain|logistics|compliance|risk|growth|brand|creative)\s+(?:engineer|developer|manager|analyst|scientist|architect|specialist|consultant|intern|director|designer|recruiter|coordinator|administrator|writer|editor|accountant|technician|officer|representative|advisor|supervisor|generalist|strategist|producer|planner|auditor|associate|lead))/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern)?.[1]?.trim();
      if (!match || match.length < 4 || match.length > 80) continue;

      const cleaned = match
        // Strip "role of …" / "the role of …" or "position of …" prefix
        .replace(/^(?:the\s+)?(?:role|position)\s+of\s+/i, '')
        // Strip leading "position " when used as a descriptor (e.g. "position Software Engineer")
        .replace(/^position\s+(?!of\b)/i, '')
        // Strip leading ATS tracking IDs like "R158633 " or "ID-12345 "
        .replace(/^(?:[A-Z]{0,3}[0-9]{4,}[-\s]+)+/g, '')
        // Strip inline/trailing tracking IDs: "(ID: 10380298)", "(Job ID: 12345)", "- REQ-999"
        .replace(/\s*\(\s*(?:id|job\s*(?:number|id|#|req)?|req(?:uisition)?)\s*:?\s*[A-Z0-9-]{3,}\s*\)/gi, '')
        .replace(/\s*[-–(]\s*(?:job\s*(?:number|id|#)?:?\s*)?[A-Z0-9]{4,}\s*\)?$/gi, '')
        .replace(/\s+at\s+\S+.*$/i, '')
        .replace(/\s+with\s+\S+.*$/i, '')
        .replace(/\b(dear|hi|hello|greetings)\b.*/i, '')
        .replace(/,.*$/, '')
        .replace(/\s{2,}/g, ' ')
        .trim();

      if (cleaned.length >= 4 && this.isValidJobTitle(cleaned)) {
        return cleaned;
      }
    }

    return 'Unknown Role';
  }

  /**
   * Returns true if the extracted text looks like a real job title.
   * Rejects sentence fragments and strings without job-related keywords.
   */
  private isValidJobTitle(text: string): boolean {
    // Reject if it starts with a stop word / sentence fragment
    if (/^(the|your|our|we|following|steps|time|please|thank|apply|applying|nk|or|and|to|for|by|if|all|any|at|in|on|an|a)\b/i.test(text)) {
      return false;
    }
    // Reject if it contains ≥2 function words — it's a sentence, not a title
    const fnWordMatches = text.match(
      /\b(that|this|which|will|would|could|should|have|has|been|was|is|are|were|be|do|does|did|can|may|might|shall|let|get|set|put|use|depend|step|follow)\b/gi
    ) || [];
    if (fnWordMatches.length >= 2) return false;

    // Must contain at least one job-related keyword
    return this.looksLikeJobTitle(text);
  }

  // ─── AI fallback extraction ──────────────────────────────────────────────────

  private async extractWithAI(subject: string, from: string, body: string): Promise<ParsedJob> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return { company: 'Unknown Company', role: 'Unknown Role' };

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are parsing a job application email. Extract the company name, job role/title, and application status.

Email subject: ${subject}
Email from: ${from}
Email body (first 800 chars): ${body.slice(0, 800)}

Reply with ONLY a JSON object in this exact format, nothing else:
{"company": "Company Name", "role": "Job Title", "status": "Applied"}

Rules:
- If you cannot determine the company, use "Unknown Company"
- If you cannot determine the role, use "Unknown Role"
- For role, use the exact title from the email (e.g. "SDE II", "Software Engineer", "Product Manager")
- Do not include tracking IDs or job IDs in the role
- For status, use ONLY one of: "Applied", "Interview", "Offer", "Rejected"
  - "Applied": application received/confirmed, thank you for applying
  - "Interview": interview invitation, phone screen, technical assessment scheduled
  - "Offer": job offer extended, offer letter
  - "Rejected": not moving forward, unfortunately, we regret to inform
  - Default to "Applied" if unsure`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Strip markdown code fences if present
    const jsonText = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

    let parsed: any;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      // Gemini returned something that isn't valid JSON — fall back to regex
      throw new Error(`Gemini returned non-JSON response: ${jsonText.slice(0, 100)}`);
    }

    const validStatuses = ['Applied', 'Interview', 'Offer', 'Rejected'];
    return {
      company: typeof parsed.company === 'string' && parsed.company ? parsed.company : 'Unknown Company',
      role: typeof parsed.role === 'string' && parsed.role ? parsed.role : 'Unknown Role',
      status: typeof parsed.status === 'string' && validStatuses.includes(parsed.status) ? parsed.status : undefined,
    };
  }

  // ─── Status detection ────────────────────────────────────────────────────────

  private detectStatus(subject: string, body: string): string {
    const text = `${subject} ${body}`.toLowerCase();

    // Rejection
    if (
      /\b(we\s+regret|regret\s+to\s+inform|we('re| are)\s+sorry\s+to)\b/.test(text) ||
      // "Unfortunately ... candidates / moving forward / candidacy" — broadened window + plurals
      /\bunfortunately\b.{0,200}\b(application|candidacy|candidates?|other\s+candidates?|moving\s+forward|not\s+moving)\b/s.test(text) ||
      // "will not be moving forward / proceeding"
      /\bwill\s+not\s+be\s+(moving\s+forward|proceeding|continuing)\b/.test(text) ||
      // "not (be) moving forward with your"
      /\bnot\s+(be\s+)?moving\s+forward\s+with\s+your\b/.test(text) ||
      // "decided / chosen not to move forward"  ← catches Microsoft-style
      /\b(decided|chosen|opted)\s+not\s+to\s+(move|proceed|continue)\s+forward\b/.test(text) ||
      // "decided not to move forward with your candidacy"
      /\bnot\s+to\s+move\s+forward\s+with\s+your\b/.test(text) ||
      // "after careful consideration ... not moving forward"
      /\bafter\s+careful\s+consideration\b.{0,200}\b(not\s+to\s+move|will\s+not\s+be|decided\s+not)\b/s.test(text) ||
      /\bnot\s+selected\b/.test(text) ||
      /\bdecided\s+to\s+(move\s+forward|proceed)\s+with\s+(other|another)\b/.test(text) ||
      /\bchosen\s+(not\s+to\s+move\s+forward|other\s+candidates?)\b/.test(text) ||
      /\b(chosen|decided|opted)\s+to\s+(?:move\s+forward|proceed|continue)\s+with\s+other\b/.test(text) ||
      /\bwe\s+(?:are|have|will\s+be)\s+moving\s+forward\s+with\s+other\b/.test(text) ||
      /\bmoving\s+forward\s+with\s+other\s+candidates?\b/.test(text) ||
      /\bwe\s+(?:have\s+)?(?:chosen|decided|selected)\s+(?:to\s+(?:move|proceed|continue)\s+with\s+)?other\s+candidates?\b/.test(text) ||
      /\bpursue\s+other\s+candidates?\b/.test(text) ||
      /\b(skills|experience|qualifications)\s+(?:more\s+)?closely\s+align\b.{0,100}\b(other|another)\b/s.test(text) ||
      /\byour\s+(application|candidacy|profile)\s+(was\s+not|has\s+not\s+been|did\s+not)\b/.test(text)
    ) {
      return 'Rejected';
    }

    // Offer
    if (
      /\boffer\s+letter\b/.test(text) ||
      /\bwe\s+(are\s+pleased|would\s+like|are\s+excited|are\s+thrilled)\s+to\s+offer\b/.test(text) ||
      /\bextend\s+(you\s+)?(an?\s+)?offer\b/.test(text) ||
      /\b(formal|job|employment)\s+offer\b/.test(text) ||
      (/\bcongratulations\b/.test(text) && /\b(offer\s+letter|formal\s+offer|start\s+date)\b/.test(text))
    ) {
      return 'Offer';
    }

    // Interview
    if (
      // Formal ATS-style patterns
      /\binterview\s+(invitation|scheduled|request)\b/.test(text) ||
      /\binterview\s+opportunity\b.{0,60}\b(you|your)\b/.test(text) ||
      /\bschedule\s+(an?\s+)?interview\b/.test(text) ||
      /\binvit(e|ed|ing)\s+(you\s+)?(to\s+)?(an?\s+)?interview\b/.test(text) ||
      /\bwe('d| would)\s+like\s+to\s+(schedule|set\s+up|arrange)\b/.test(text) ||
      /\bphone\s+(screen|interview|call)\b/.test(text) ||
      /\btechnical\s+(screen|interview|assessment)\b/.test(text) ||
      /\b(onsite|virtual|video)\s+interview\b/.test(text) ||
      // "interview" anywhere in the text is a strong enough standalone signal.
      // Rejection and Offer are checked first (higher priority), so this never
      // downgrades a rejection/offer email — it only upgrades "Applied" → "Interview".
      /\binterview\b/.test(text) ||
      // Human recruiter scheduling thread patterns
      // "your interview" — subject "Re: Apple Interview" or body "your interview with Luke"
      /\byour\s+interview\b/.test(text) ||
      // "scheduled interview" — recruiter reversed word order
      /\bschedul\w*\s+(?:an?\s+)?interview\b/.test(text) ||
      // "interview with [Name/Team]"
      /\binterview\s+with\b/.test(text) ||
      // "rescheduled … interview"
      /\breschedul\w+\b.{0,80}\binterview\b/s.test(text) ||
      // "interview on/at/this/next [date/time]"
      /\binterview\s+(?:on|at|this|next)\b/.test(text) ||
      // "confirm/confirmed your interview"
      /\bconfirm\w*\s+(?:your\s+)?interview\b/.test(text) ||
      /\binterview\s+confirm\w*\b/.test(text) ||
      // Coding / take-home assessments
      /\bcoding\s+(challenge|assessment|test)\b/.test(text) ||
      /\btake.?home\s+(assessment|challenge|test|project)\b/.test(text)
    ) {
      return 'Interview';
    }

    return 'Applied';
  }

  // ─── Job email content filter ────────────────────────────────────────────────

  private isJobRelatedEmail(subject: string, body: string, from: string): boolean {
    const fullText = `${subject} ${body}`.toLowerCase();

    // Hard reject: financial / transactional / unrelated marketing patterns.
    // Keep these NARROW — only reject if the signal is unambiguous and cannot
    // appear inside a real job email.
    const nonJobPatterns = [
      /\bcredit\s+card\b/,
      /\bdebit\s+card\b/,
      /\bpayment\s+(applied|received|due|processed|confirmed)\b/,
      /\binvoice\b/,
      /\border\s+(confirmation|placed|shipped|delivered)\b/,
      /\bnewsletter\b/,
      /\bpurchase\s+confirmation\b/,
      /\bcash\s+back\b/,
      /\breward\s+points?\b/,
      /\byour\s+order\b/,
      /\bshipment\b/,
      /\btracking\s+number\b/,
      // Talent-network welcome / onboarding / marketing emails only
      // (requires explicit platform/community language to avoid false positives)
      /\bwelcome\s+to\s+(the\s+|our\s+)?[^.!?]{0,60}?\b(talent\s+network|talent\s+community|talent\s+portal)\b/i,
      /\bcomplete\s+(your|the)\s+(profile|account|registration)\b/i,
      /\bjoin\s+our\s+(?:talent\s+)?(?:network|platform|community)\b/i,
      /\byou(?:'ve|\s+have)\s+(?:joined|been\s+added\s+to|registered\s+(?:for|with))\b/i,
      // Only reject "browse our job board" — not "explore opportunities" (used in real rejection emails)
      /\bbrowse\s+(our\s+)?job\s+board\b/i,
    ];
    for (const p of nonJobPatterns) {
      if (p.test(fullText)) return false;
    }

    // Must have at least one strong job signal.
    // Each pattern is matched case-insensitively against subject + body combined.
    const jobPatterns = [
      // ── Application confirmation ─────────────────────────────────────────────
      /\byour\s+application\s+(has\s+been|for|to|was|is)\b/,
      /\bapplication\s+(received|submitted|under\s+review|reviewed|status)\b/,
      /\bthank\s+(you\s+)?for\s+(applying|your\s+application)\b/,
      // "Thank you for your interest …" — Microsoft, NVIDIA, Apple style
      /\bthank\s+you\s+for\s+your\s+interest\b/,
      // "Thank you from [Company]" — NVIDIA Workday style subject
      /\bthank\s+you\s+from\b/,
      // "your interest in the position of …" / "interest in this opportunity"
      /\byour\s+interest\s+in\s+(?:the\s+)?(?:position|role|job|opportunity|opening)\b/,
      /\binterest\s+in\s+(?:the\s+)?position\s+of\b/,
      // "invested in the application process" — Microsoft rejection
      /\binvested\s+in\s+the\s+application\b/,
      // "we appreciate your interest / time / passion …" near "application"
      /\bappreciate\b.{0,120}\bapplication\b/s,
      // ── Review / status update ───────────────────────────────────────────────
      /\bwe\s+(have\s+)?(received|reviewed)\s+your\s+application\b/,
      /\bwe\s+have\s+reviewed\s+your\s+(application|candidacy|profile)\b/,
      /\byour\s+application\s+is\s+(being|currently)\s+(reviewed|considered)\b/,
      // ── Rejection signals ────────────────────────────────────────────────────
      /\bwe\s+regret\s+to\s+(inform|let\s+you\s+know)\b/,
      /\b(decided|chosen)\s+not\s+to\s+move\s+forward\b/,
      // "decided not to move forward for the [Role]" — NVIDIA / Workday phrasing
      /\bdecided\s+not\s+to\s+move\s+forward\s+for\s+the\b/,
      /\bmoving\s+forward\s+with\s+other\s+candidates?\b/,
      /\bunfortunately\b.{0,200}\b(application|candidacy|candidates?|moving\s+forward)\b/s,
      /\bnot\s+selected\b/,
      /\bwish\s+you\s+(the\s+best|success)\s+in\s+your\s+(job\s+)?search\b/,
      /\bbest\s+of\s+luck\s+in\s+(your\s+)?(job\s+)?search\b/,
      /\bpursue\s+other\s+candidates?\b/,
      // ── Offer ────────────────────────────────────────────────────────────────
      /\bjob\s+offer\b/,
      /\boffer\s+letter\b/,
      /\bwe\s+(are\s+pleased|would\s+like|are\s+excited)\s+to\s+offer\b/,
      // ── Interview ────────────────────────────────────────────────────────────
      // Formal ATS-style patterns
      /\binterview\s+(invitation|request|scheduled|opportunity|for\s+the)\b/,
      /\binvit(e|ed|ing)\s+(you\s+)?(to\s+)?(an?\s+)?interview\b/,
      /\bwe('d| would)\s+like\s+to\s+(schedule|set\s+up|arrange)\b/,
      // Human recruiter scheduling thread patterns ("Re: Apple Interview - Monday, May 11")
      // "your interview" — most reliable signal in scheduling emails
      /\byour\s+interview\b/,
      // "scheduled/schedule an interview" (note: "scheduled interview" = recruiter reversed word order)
      /\bschedul\w*\s+(?:an?\s+)?interview\b/,
      // "interview with [Name/Team]" — "interview with Luke", "interview with the team"
      /\binterview\s+with\b/,
      // "rescheduled ... interview" — "rescheduled from April 24th" in an interview thread
      /\breschedul\w+\b.{0,80}\binterview\b/s,
      // "confirmed / confirm your interview" or "interview confirmed"
      /\binterview\s+confirm\w*\b/,
      /\bconfirm\w*\s+(?:your\s+)?interview\b/,
      // "interview on Monday / at 2pm / this Friday" — date/time context
      /\binterview\s+(?:on|at|this|next)\b/,
      /\bphone\s+(screen|interview)\b/,
      /\btechnical\s+(screen|interview|assessment)\b/,
      /\bcoding\s+(challenge|assessment|test)\b/,
      /\btake.?home\s+(assessment|challenge|test|project)\b/,
      /\bonsite\s+interview\b/,
      /\bvirtual\s+interview\b/,
      // ── General reliable signals ─────────────────────────────────────────────
      /\bapplied\s+for\s+the\s+(position|role|job|opening)\b/,
      /\byour\s+candidacy\b/,
      /\brecruiting\s+team\b/,
      /\bhiring\s+(manager|team)\b/,
      /\bcongratulations\b.*\b(offer|position|role)\b/,
      // "position of [Role]" in body — Microsoft / Workday phrasing
      /\bposition\s+of\s+[A-Z]/,
      // "for the [JR/REQ tracking ID] [Role] role" — NVIDIA Workday pattern
      /\bfor\s+the\s+[A-Z]{1,4}\d{4,}\s+\S/,
    ];
    return jobPatterns.some((p) => p.test(fullText));
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  private getHeader(headers: any[], name: string): string {
    return headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value || '';
  }

  private extractMessageDate(message: any): Date | null {
    const ms = Number(message?.internalDate);
    if (!Number.isNaN(ms) && ms > 0) return new Date(ms);

    const headers = message?.payload?.headers || [];
    const dateHeader = headers.find((h: any) => h.name?.toLowerCase() === 'date');
    if (dateHeader?.value) {
      const parsed = new Date(dateHeader.value);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }
    return null;
  }

  private cleanCompanyName(name: string): string {
    const cleaned = name
      .replace(
        /\b(talent\s+team|talent\s+acquisition|recruiting\s+team|recruitment|hr\s+team|human\s+resources|careers?|jobs?|hiring\s+team|hiring\s+manager|notifications?|noreply|no.reply|do.?not.?reply|staffing|department)\b/gi,
        ''
      )
      .replace(/\s{2,}/g, ' ')
      .trim();
    return cleaned.length > 1 ? cleaned : name.trim();
  }

  /**
   * Heuristic: does this string look like a job title?
   * Used to validate right-side of "[Company] - [Role]" subject splits.
   */
  private looksLikeJobTitle(text: string): boolean {
    return (
      // Role title keywords — covers tech and non-tech positions
      /\b(engineer|developer|manager|analyst|scientist|designer|architect|intern|director|specialist|consultant|lead|associate|recruiter|coordinator|administrator|writer|editor|accountant|technician|officer|representative|planner|strategist|executive|advisor|supervisor|auditor|operator|producer|generalist|copywriter|researcher|librarian)\b/i.test(text) ||
      // Tech domain keywords
      /\b(software|frontend|backend|full.?stack|data|devops|cloud|mobile|product|program|project|qa|security|platform|sre|ml|ai|hardware|network|infrastructure|systems|embedded|firmware|cybersecurity|blockchain|game|robotics|ui|ux)\b/i.test(text) ||
      // Non-tech domain keywords
      /\b(marketing|sales|finance|legal|operations|business|content|technical|communications|graphic|supply\s+chain|logistics|compliance|risk|growth|brand|creative|human\s+resources|customer\s+success|customer\s+support)\b/i.test(text) ||
      // Common role abbreviations
      /\b(SDE|SWE|SRE|TPM|PM|MLE|SDM|EM|IC|SDET|QA|VP|HR)\b/.test(text)
    );
  }

  // ─── DB upsert ───────────────────────────────────────────────────────────────

  private async upsertJob(params: {
    userId: string;
    threadId: string;
    lastMessageId: string;
    sourceEmail: string;
    company: string;
    role: string;
    status: string;
    appliedDate: Date;
  }) {
    // ── Step 1: exact threadId match (same email thread) ──────────────────────
    let existing = await this.jobRepo.findOne({
      where: { threadId: params.threadId, user: { id: params.userId } },
      relations: ['user'],
    });

    // ── Step 2: cross-thread match by company + role ───────────────────────────
    // Handles the common case where the application confirmation and the
    // rejection / interview invite arrive in DIFFERENT Gmail threads
    // (e.g. ATS confirmation → noreply@greenhouse.io, interview → recruiter@company.com)
    if (!existing && params.company !== 'Unknown Company' && params.role !== 'Unknown Role') {
      const normCompany = this.normalizeForMatch(params.company);
      const normRole    = this.normalizeForMatch(params.role);

      // Only look within a 90-day window to avoid merging separate application cycles
      const windowStart = new Date(params.appliedDate.getTime() - 90 * 24 * 60 * 60 * 1000);
      const windowEnd   = new Date(params.appliedDate.getTime() + 90 * 24 * 60 * 60 * 1000);

      const candidates = await this.jobRepo.find({
        where: { user: { id: params.userId } },
        relations: ['user'],
      });

      existing = candidates.find((job) => {
        if (!job.appliedDate) return false;
        const jobDate = new Date(job.appliedDate);
        const withinWindow = jobDate >= windowStart && jobDate <= windowEnd;
        const companyMatch = this.normalizeForMatch(job.company) === normCompany;
        const roleMatch    = this.normalizeForMatch(job.role)    === normRole;
        return withinWindow && companyMatch && roleMatch;
      }) ?? null;

      if (existing) {
        this.logger.debug(
          `cross-thread-match threadId=${params.threadId} matched job=${existing.id} company="${params.company}" role="${params.role}"`
        );
      }
    }

    // ── Apply update or create ─────────────────────────────────────────────────
    if (existing) {
      // Status only ever moves up the priority scale — never downgrades
      const currentPriority = this.STATUS_PRIORITY[existing.status] ?? 0;
      const newPriority     = this.STATUS_PRIORITY[params.status]   ?? 0;
      if (newPriority > currentPriority) existing.status = params.status;

      existing.lastMessageId = params.lastMessageId;
      existing.sourceEmail   = params.sourceEmail;
      if (!existing.appliedDate) existing.appliedDate = params.appliedDate;
      if (this.isFalsePositiveValue(existing.company) && params.company !== 'Unknown Company') {
        existing.company = params.company;
      }
      if (this.isFalsePositiveValue(existing.role) && params.role !== 'Unknown Role') {
        existing.role = params.role;
      }
      await this.jobRepo.save(existing);
    } else {
      await this.jobRepo.save(
        this.jobRepo.create({
          user: { id: params.userId },
          company: params.company,
          role: params.role,
          status: params.status,
          threadId: params.threadId,
          lastMessageId: params.lastMessageId,
          sourceEmail: params.sourceEmail,
          appliedDate: params.appliedDate,
        })
      );
    }
  }

  /**
   * Returns true when a stored company / role value looks like a false-positive
   * extracted from email boilerplate.  These get overwritten on the next scan.
   *
   * Examples of false-positive company names:
   *   "this address", "our website", "discussing the position further", "other roles at Anthropic"
   * Examples of false-positive role names:
   *   "position Software Engineer", "the Software Engineer role"
   */
  private isFalsePositiveValue(value: string): boolean {
    if (!value || value === 'Unknown Company' || value === 'Unknown Role') return true;
    // Boilerplate words found in company names
    if (/\b(address|email\s+address|inbox|page|link|website|url|form|here|there)\b/i.test(value)) return true;
    // Company candidate is actually a sentence fragment (contains " at ", "role", "position", verbs)
    if (/\b(position|role|roles|opportunity|discussing|considering|reviewing|proceeding|others?)\b/i.test(value)) return true;
    // Role starts with "position " artifact from parsing
    if (/^position\s+/i.test(value)) return true;
    // Value contains " and [lowercase verb/word]" — sentence fragment stitched together
    if (/\s+and\s+[a-z]/i.test(value)) return true;
    return false;
  }

  /**
   * Normalize a string for fuzzy matching:
   * lowercase → strip all non-alphanumeric → collapse spaces.
   * "Hewlett-Packard Enterprise" === "hewlettpackardenterprise"
   * "Software Engineer II"       === "softwareengineer2"  (roman → arabic via pre-pass)
   */
  private normalizeForMatch(text: string): string {
    return text
      .toLowerCase()
      .replace(/\bii\b/g, '2')
      .replace(/\biii\b/g, '3')
      .replace(/\biv\b/g, '4')
      .replace(/[^a-z0-9]/g, '')
      .trim();
  }

  // ─── Public CRUD ─────────────────────────────────────────────────────────────

  async getJobsForUser(userId: string) {
    return this.jobRepo.find({
      where: { user: { id: userId } },
      order: { appliedDate: 'DESC' },
      relations: ['user'],
    });
  }

  async createManualJob(userId: string, dto: ManualJobDto): Promise<JobApplication> {
    return this.jobRepo.save(
      this.jobRepo.create({
        user: { id: userId },
        company: dto.company,
        role: dto.role,
        status: dto.status ?? 'Applied',
        appliedDate: dto.appliedDate ? new Date(dto.appliedDate) : new Date(),
        notes: dto.notes ?? undefined,
        source: 'manual',
      }),
    );
  }

  async updateJob(userId: string, jobId: string, dto: UpdateJobDto): Promise<JobApplication> {
    const job = await this.jobRepo.findOne({
      where: { id: jobId, user: { id: userId } },
      relations: ['user'],
    });
    if (!job) throw new NotFoundException('Job not found');

    if (dto.company?.trim()) job.company = dto.company.trim();
    if (dto.role?.trim()) job.role = dto.role.trim();
    if (dto.status !== undefined) job.status = dto.status;
    if (dto.notes !== undefined) job.notes = dto.notes;

    return this.jobRepo.save(job);
  }

  async deleteJob(userId: string, jobId: string): Promise<{ message: string }> {
    const job = await this.jobRepo.findOne({
      where: { id: jobId, user: { id: userId } },
      relations: ['user'],
    });
    if (!job) throw new NotFoundException('Job not found');
    await this.jobRepo.remove(job);
    return { message: 'Job deleted successfully' };
  }
}
