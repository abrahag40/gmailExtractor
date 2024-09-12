import { Injectable, Logger } from '@nestjs/common';
import { OAuth2Service } from 'src/common/services/oauth2.service';
import { VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly oauth2Service: OAuth2Service,
  ) {}

  // Método para obtener el access token utilizando el refresh token
  async getAccessToken(): Promise<string> {
    try {
      const { token } = await this.oauth2Service.getAccessToken();
      if (!token) {
        throw new Error('Failed to obtain access token');
      }
      return token;
    } catch (error) {
      this.logger.error('Failed to get access token', error.stack);
      throw new Error('Could not get access token');
    }
  }

  // Método para generar la URL de autorización
  generateAuthUrl(): string {
    const scopes = ['https://www.googleapis.com/auth/gmail.readonly'];
    const authUrl = this.oauth2Service.generateAuthUrl(scopes);
    console.log('Authorize this app by visiting this url:', authUrl);
    return authUrl;
  }
  
  // Método para intercambiar el código de autorización por un access token y refresh token
  async getTokens(code: string) {
    try {
      const oauth2Client = this.oauth2Service.getClient();

      const { tokens } = await this.oauth2Service.getToken(code);
      oauth2Client.setCredentials(tokens);

      this.logger.log('Access Token:', tokens.access_token);
      this.logger.log('Refresh Token:', tokens.refresh_token);

      // Aquí puedes almacenar el refresh token en un lugar seguro si es necesario
      return tokens;
    } catch (error) {
      this.logger.error('Failed to get tokens', error.stack);
      throw new Error('Could not get tokens');
    }
  }


  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    const { name, emails } = profile;
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      accessToken,
    };
    done(null, user);
  }
}
