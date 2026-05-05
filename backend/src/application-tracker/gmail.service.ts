import { google } from 'googleapis';
import { Injectable } from '@nestjs/common';

export interface RefreshedTokens {
  accessToken: string;
  refreshToken?: string;
  tokenExpiry?: Date;
}

@Injectable()
export class GmailService {
  private oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_GMAIL_CALLBACK_URL ||
      'http://localhost:3001/application-tracker/gmail/callback'
  );

  getAuthUrl(userId: string) {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/gmail.readonly'],
      state: userId,
      prompt: 'consent',
    });
  }

  async getTokensFromCode(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }

  async refreshAccessToken(
    refreshToken: string,
    tokenExpiry?: Date,
    currentAccessToken?: string
  ): Promise<RefreshedTokens> {
    const isExpired =
      !tokenExpiry || tokenExpiry.getTime() - Date.now() < 5 * 60 * 1000;

    if (!isExpired && currentAccessToken) {
      return { accessToken: currentAccessToken, refreshToken, tokenExpiry };
    }

    this.oauth2Client.setCredentials({
      refresh_token: refreshToken,
      access_token: currentAccessToken,
      expiry_date: tokenExpiry?.getTime(),
    });

    const accessTokenResponse = await this.oauth2Client.getAccessToken();
    const credentials = this.oauth2Client.credentials;
    const refreshedAccessToken =
      accessTokenResponse?.token || credentials.access_token || '';

    if (!refreshedAccessToken) {
      throw new Error('Unable to refresh Gmail access token');
    }

    return {
      accessToken: refreshedAccessToken,
      refreshToken: credentials.refresh_token || refreshToken,
      tokenExpiry: credentials.expiry_date
        ? new Date(credentials.expiry_date)
        : tokenExpiry,
    };
  }

  // ─── Thread-based fetching (preferred) ──────────────────────────────────────

  /**
   * Fetch threads matching the search query.
   * Threads group all emails about the same job into one unit.
   */
  async fetchRecentThreads(
    accessToken: string,
    searchQuery: string,
    maxResults = 100,
    pageToken?: string,
  ) {
    this.oauth2Client.setCredentials({ access_token: accessToken });
    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

    const response = await gmail.users.threads.list({
      userId: 'me',
      q: searchQuery,
      maxResults,
      pageToken,
    });

    return {
      threads: response.data.threads || [],
      nextPageToken: response.data.nextPageToken ?? undefined,
    };
  }

  /**
   * Get all messages in a thread with full body data.
   * Messages are returned oldest-first — ideal for processing application
   * confirmation (msg[0]) separately from status-update emails (msg[1..n]).
   */
  async getThreadDetails(accessToken: string, threadId: string) {
    this.oauth2Client.setCredentials({ access_token: accessToken });
    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

    const response = await gmail.users.threads.get({
      userId: 'me',
      id: threadId,
      format: 'full',
    });

    return response.data;
  }

  // ─── Email body decoding ─────────────────────────────────────────────────────

  /**
   * Decode the full plain-text body from a Gmail message payload.
   * Handles simple emails, multipart/alternative, and deeply nested parts.
   * Prefers text/plain; falls back to text/html (stripped).
   * Returns at most MAX_BODY_CHARS characters to avoid huge email bodies.
   */
  decodeEmailBody(payload: any, maxChars = 8000): string {
    if (!payload) return '';

    const text = this._extractText(payload);
    return text.slice(0, maxChars);
  }

  private _extractText(payload: any): string {
    // Direct body with data (simple single-part email)
    if (payload.body?.data) {
      const decoded = this._decodeBase64(payload.body.data);
      return payload.mimeType === 'text/html'
        ? this.stripHtml(decoded)
        : decoded;
    }

    if (!payload.parts || payload.parts.length === 0) return '';

    // Prefer text/plain
    const plainPart = this._findPart(payload.parts, 'text/plain');
    if (plainPart?.body?.data) {
      return this._decodeBase64(plainPart.body.data);
    }

    // Fall back to text/html
    const htmlPart = this._findPart(payload.parts, 'text/html');
    if (htmlPart?.body?.data) {
      return this.stripHtml(this._decodeBase64(htmlPart.body.data));
    }

    // Recurse into nested multipart containers
    for (const part of payload.parts) {
      const result = this._extractText(part);
      if (result.trim()) return result;
    }

    return '';
  }

  private _findPart(parts: any[], mimeType: string): any {
    for (const part of parts) {
      if (part.mimeType === mimeType && part.body?.data) return part;
      if (part.parts) {
        const found = this._findPart(part.parts, mimeType);
        if (found) return found;
      }
    }
    return null;
  }

  private _decodeBase64(data: string): string {
    // Gmail uses base64url (- instead of +, _ instead of /)
    return Buffer.from(data, 'base64url').toString('utf-8');
  }

  stripHtml(html: string): string {
    return html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(?:p|div|li|tr|td|th|h[1-6]|blockquote)>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s{3,}/g, '\n')
      .trim();
  }

  async fetchRecentEmails(
    accessToken: string,
    searchQuery = 'newer_than:180d',
    maxResults = 100,
    pageToken?: string,
  ): Promise<{
    messages: { id?: string | null; threadId?: string | null }[];
    nextPageToken?: string;
  }> {
    this.oauth2Client.setCredentials({ access_token: accessToken });
    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: searchQuery,
      maxResults,
      pageToken,
    });
    return {
      messages: response.data.messages || [],
      nextPageToken: response.data.nextPageToken ?? undefined,
    };
  }

  async getEmailDetails(accessToken: string, messageId: string) {
    this.oauth2Client.setCredentials({ access_token: accessToken });
    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
    const message = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full',
    });
    return message.data;
  }
}
