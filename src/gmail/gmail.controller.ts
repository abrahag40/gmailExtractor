import { Controller, Get, Post } from '@nestjs/common';
import { GmailService } from './gmail.service';
import { AuthService } from 'src/auth/auth.service';

@Controller('gmail')
export class GmailController {
  constructor(
    private gmailService: GmailService,
    private readonly authService: AuthService,
  ) {}

  @Get('emails')
  async getEmails() {
    try {
      // Obtener el access token utilizando el AuthService
      const accessToken = await this.authService.getAccessToken();      

      // Obtener los correos recientes usando el GmailService
      const recentEmails = await this.gmailService.getRecentEmails(accessToken);
      
      // Retornar los correos como respuesta
      return recentEmails;
    } catch (error) {
      return {
        statusCode: 500,
        message: 'Internal server error',
        error: error.message,
      };
    }
  }

  @Post('process')
  async processEmails() {
    try {
      const accessToken = await this.authService.getAccessToken();
      const recentEmails = await this.gmailService.getRecentEmails(accessToken);
      
      // Llama al servicio para procesar los correos electrónicos
      await this.gmailService.processEmails(recentEmails.messages, accessToken);
      return { statusCode: 200, message: 'Emails processed successfully' };
    } catch (error) {
      return {
        statusCode: 500,
        message: 'Internal server error',
        error: error,
      };
    }
  }

}
