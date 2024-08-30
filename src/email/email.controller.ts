import { Controller, Get, Param } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('emails')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  // Endpoint para obtener todos los resultados de correos procesados
  @Get()
  async getAllEmails() {
    return this.emailService.findAll();
  }

  // Endpoint para obtener un resultado de correo específico por ID
  @Get(':id')
  async getEmailById(@Param('id') id: number) {
    return this.emailService.findOne(id);
  }

  // Endpoint para obtener los correos que tienen coincidencias
  @Get('matches')
  async getMatchingEmails() {
    return this.emailService.findMatchingEmails();
  }
}
