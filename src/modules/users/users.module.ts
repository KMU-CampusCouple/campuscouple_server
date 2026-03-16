import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { S3Service } from 'src/common/services/s3.service';

@Module({
  imports: [JwtModule.register({ secret: process.env.JWT_SECRET })],
  controllers: [UsersController],
  providers: [UsersService, PrismaService, S3Service],
  exports: [UsersService],
})
export class UsersModule {}
