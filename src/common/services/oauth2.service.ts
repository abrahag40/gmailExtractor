import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';

@Injectable()
export class OAuth2Service {
  private oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
  );

  constructor() {
    // Configurar las credenciales iniciales
    this.oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });
  }

  getClient() {
    return this.oauth2Client;
  }

  getAccessToken() {
    return this.oauth2Client.getAccessToken();
  }

  getToken(token: string) {
    return this.oauth2Client.getToken(token);
  }

  generateAuthUrl(scopes) {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline', // Necesario para obtener un refresh token
      scope: scopes,
    });
  }
}
