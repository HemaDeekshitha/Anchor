// C:\Users\nsais\Anchor\backend\src\application-tracker\gmail.service.ts
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
      state: userId, // pass userId securely
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
    // Check if token is expired or about to expire (within 5 minutes)
    const isExpired =
      !tokenExpiry || tokenExpiry.getTime() - Date.now() < 5 * 60 * 1000;

    if (!isExpired && currentAccessToken) {
      return {
        accessToken: currentAccessToken,
        refreshToken,
        tokenExpiry,
      };
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

  async fetchRecentEmails(accessToken: string, searchQuery = 'newer_than:30d', maxResults = 100) {
    this.oauth2Client.setCredentials({ access_token: accessToken });

    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: searchQuery,
      maxResults,
    });

    return response.data.messages || [];
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