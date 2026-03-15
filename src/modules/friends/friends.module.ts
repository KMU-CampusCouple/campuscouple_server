import { Module } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { JwtModule } from '@nestjs/jwt';
import { FriendsController } from './friends.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [JwtModule.register({ secret: process.env.JWT_SECRET })],
  controllers: [FriendsController],
  providers: [FriendsService, PrismaService],
  exports: [FriendsService],
})
export class FriendsModule {}
