import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [ConfigModule.forRoot(), AuthModule, UsersModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
