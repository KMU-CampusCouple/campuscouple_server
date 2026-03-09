import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaService } from '../../prisma/prisma.service';
import { ConsoleMailService } from '../../common/services/mail.service';
import { HttpModule, HttpService } from '@nestjs/axios';
import { RealTossService } from './services/real-toss.service';
import { MockTossService } from './services/mock-toss.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '24h' },
    }),
    HttpModule,
    ConfigModule, // ConfigService 주입을 위해 추가
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    PrismaService,
    {
      provide: 'MailService',
      useClass: ConsoleMailService,
    },
    {
      provide: 'TossService',
      useFactory: (configService: ConfigService, httpService: HttpService) => {
        const mode = configService.get<string>('TOSS_MODE', 'REAL');
        if (mode === 'MOCK') {
          return new MockTossService();
        }
        return new RealTossService(httpService);
      },
      inject: [ConfigService, HttpService],
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
