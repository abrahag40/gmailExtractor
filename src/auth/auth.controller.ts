import { Controller, Get, Query, Redirect, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @Redirect()
  googleAuth() {
    const url = this.authService.generateAuthUrl();
    return { url };
  }

  // Endpoint para manejar el callback de Google y obtener los tokens
  @Get('google/callback')
  async googleAuthRedirect(@Query('code') code: string) {
    try {
      const tokens = await this.authService.getTokens(code);
      return {
        message: 'Tokens obtained successfully',
        tokens,
      };
    } catch (error) {
      return {
        statusCode: 500,
        message: 'Failed to obtain tokens',
        error: error.message,
      };
    }
  }
}
