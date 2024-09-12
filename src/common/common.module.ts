import { Module, Global } from '@nestjs/common';
import { OAuth2Service } from './services/oauth2.service';

@Global()
@Module({
  providers: [OAuth2Service],
  exports: [OAuth2Service],
})
export class CommonModule {}
