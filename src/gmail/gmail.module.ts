import { AuthModule } from 'src/auth/auth.module';
import { EmailModule } from '../email/email.module';
import { GmailController } from './gmail.controller';
import { GmailService } from './gmail.service';
import { GmailWebhookController } from './gmail-webhook.controller';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { PDFService } from './pdf.service';
import { PubSubModule } from 'src/pubsub/pubsub.module';

@Module({
  imports: [
    AuthModule,
    EmailModule,
    HttpModule,
    PubSubModule
  ],
  providers: [GmailService, PDFService],
  controllers: [GmailController, GmailWebhookController],
})
export class GmailModule {}
