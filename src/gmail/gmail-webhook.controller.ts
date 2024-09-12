import { Controller, Post, Req, Res } from '@nestjs/common';
import { GmailService } from './gmail.service';

@Controller('gmail')
export class GmailWebhookController {
  constructor(private readonly gmailService: GmailService) {}

  @Post('webhook')
  async handleGmailWebhook(@Req() req, @Res() res) {
    const { body } = req;
    // Validar que sea una notificación real de Gmail
    if (body && body.historyId) {
      // Procesar el email asociado a esta notificación
    }
    return res.status(200).send(
      {
        status: 'ok',
        body
      }
    );
  }
}
