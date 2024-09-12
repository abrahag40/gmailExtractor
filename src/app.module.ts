import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { ConfigModule } from '@nestjs/config';
import { Email } from './email/email.entity';
import { EmailModule } from './email/email.module';
import { GmailModule } from './gmail/gmail.module';
import { Module } from '@nestjs/common';
import { PubSubModule } from './pubsub/pubsub.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogoModule } from './catalogo/catalogo.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_ENDPOINT,
      port: 5432,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      autoLoadEntities: true,
      synchronize: true, // Sincroniza automáticamente las entidades, para desarrollo (no recomendado en producción)
      ssl: {
        rejectUnauthorized: false, // Esto es útil para evitar problemas de certificados no verificados
      },
      entities: [__dirname + '/../**/*.entity.js', Email],
    }),
    AuthModule,
    CommonModule,
    EmailModule,
    GmailModule,
    PubSubModule,
    CatalogoModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
