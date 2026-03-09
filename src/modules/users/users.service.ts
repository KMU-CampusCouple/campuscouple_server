import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { User, Profile } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async createProfile(createProfileDto: CreateProfileDto, tempToken: string) {
    // tempToken 검증
    let payload: any;
    try {
      payload = this.jwtService.verify(tempToken);
    } catch (error) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }
    if (!payload.verified || !payload.email || !payload.tossUserKey) {
      throw new UnauthorizedException('인증되지 않은 토큰입니다.');
    }

    // User 생성
    const user = (await this.prisma.user.update({
      where: { tossUserKey: payload.tossUserKey },
      data: {
        email: payload.email,
        isVerified: true,
        profile: {
          create: {
            name: createProfileDto.name,
            gender: createProfileDto.gender,
            univ: createProfileDto.univ,
            major: createProfileDto.major,
            studentId: createProfileDto.studentId,
            mbti: createProfileDto.mbti,
            region: createProfileDto.region,
            intro: createProfileDto.intro,
            snsAccounts: createProfileDto.snsAccounts as any,
            profileImage: createProfileDto.profileImage,
          },
        },
      },
      include: {
        profile: true,
      },
    })) as User & { profile: Profile };

    return {
      userId: user.id,
      profileId: user.profile.id,
    };
  }

  async getMyProfile(userId: number) {
    const user = (await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    })) as User & { profile: Profile | null };

    if (!user || !user.profile) {
      throw new BadRequestException('프로필을 찾을 수 없습니다.');
    }

    return {
      userId: user.id,
      name: user.profile.name,
      univ: user.profile.univ,
      profileImage: user.profile.profileImage,
      snsAccounts: user.profile.snsAccounts as any,
      // 필요한 필드 추가
    };
  }
}
