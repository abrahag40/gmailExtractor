import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GmailService } from './gmail.service';
import { GmailController } from './gmail.controller';
import { EmailModule } from '../email/email.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    AuthModule,
    EmailModule,
    HttpModule,
  ],
  providers: [GmailService],
  controllers: [GmailController],
})
export class GmailModule {}
