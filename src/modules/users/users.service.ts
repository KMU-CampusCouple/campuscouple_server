import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { User, Profile } from '@prisma/client';
import { GetMeetingsSummaryDto } from './dto/get-meetings-summary.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { GetSearchProfilesDto, SearchProfileDto } from './dto/get-search-profiles-dto';

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

  async getMyProfile(token: string) {
    let payload: any;

    try {
      payload = this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }

    if (!payload.tossUserKey || !payload.sub) {
      throw new UnauthorizedException('인증되지 않은 토큰입니다.');
    }
    const user = (await this.prisma.user.findUnique({
      where: { id: payload.sub },
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

  async updateProfile(updateProfileDto: UpdateProfileDto, profileId: number) {
    const updateProfile = Object.entries(updateProfileDto).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }

      return acc;
    }, {});

    await this.prisma.profile.update({
      where: { id: profileId },
      data: updateProfile,
    });
  }

  async getMyMeetings(profileId: number) {
    const meetings = await this.prisma.meeting.findMany({
      where: { creatorId: profileId },
      include: {
        participants: {
          include: {
            profile: {
              select: { profileImage: true },
            },
          },
        },
        _count: {
          select: {
            participants: { where: { status: 'ACCEPTED' } },
          },
        },
      },
    });

    if (meetings.length === 0) {
      throw new NotFoundException('사용자가 작성한 미팅글이 없습니다.');
    }

    return meetings.map((meeting) => {
      return new GetMeetingsSummaryDto({
        id: meeting.id,
        title: meeting.title,
        memberCount: meeting.capacity,
        currentCount: meeting._count.participants,
        participants: meeting.participants.map((p) => ({
          profileImage: p.profile.profileImage,
        })),
      });
    });
  }

  async getMyParticipations(profileId: number) {
    const meetingParticipants = await this.prisma.meetingParticipant.findMany({
      where: {
        profileId: profileId,
        meeting: {
          NOT: {
            creatorId: profileId,
          },
        },
      },
      include: {
        meeting: {
          include: {
            participants: {
              include: {
                profile: {
                  select: { profileImage: true },
                },
              },
            },
            _count: {
              select: { participants: { where: { status: 'ACCEPTED' } } },
            },
          },
        },
      },
      orderBy: {
        meeting: {
          createdAt: 'desc',
        },
      },
    });

    if (meetingParticipants.length === 0) {
      throw new NotFoundException('사용자가 신청한 미팅글이 없습니다.');
    }

    return meetingParticipants.map((meetingParticipant) => {
      return new GetMeetingsSummaryDto({
        id: meetingParticipant.meeting.id,
        title: meetingParticipant.meeting.title,
        memberCount: meetingParticipant.meeting.capacity,
        currentCount: meetingParticipant.meeting._count.participants,
        participants: meetingParticipant.meeting.participants.map((p) => ({
          profileImage: p.profile.profileImage,
        })),
      });
    });
  }

  async getMyMatchedMeetings(profileId: number) {
    const matchedParticipations = await this.prisma.meetingParticipant.findMany({
      where: {
        profileId: profileId,
        status: 'ACCEPTED',
        meeting: {
          NOT: {
            creatorId: profileId,
          },
        },
      },
      include: {
        meeting: {
          include: {
            participants: {
              include: {
                profile: {
                  select: { profileImage: true },
                },
              },
            },
            _count: {
              select: { participants: { where: { status: 'ACCEPTED' } } },
            },
          },
        },
      },
      orderBy: {
        meeting: {
          dateTime: 'desc',
        },
      },
    });

    if (matchedParticipations.length === 0) {
      throw new NotFoundException('사용자가 매칭된 미팅글이 없습니다.');
    }

    return matchedParticipations.map((meetingParticipant) => {
      return new GetMeetingsSummaryDto({
        id: meetingParticipant.meeting.id,
        title: meetingParticipant.meeting.title,
        memberCount: meetingParticipant.meeting.capacity,
        currentCount: meetingParticipant.meeting._count.participants,
        participants: meetingParticipant.meeting.participants.map((p) => ({
          profileImage: p.profile.profileImage,
        })),
      });
    });
  }

  async getSearchProfiles(profileId: number, keyword: string) {
    const profiles = await this.prisma.profile.findMany({
      where: {
        AND: [
          { id: { not: profileId } },
          {
            OR: [
              { name: { contains: keyword, mode: 'insensitive' } },
              { univ: { contains: keyword, mode: 'insensitive' } },
            ],
          },
        ],
      },
      include: {
        sentRequests: { where: { receiverId: profileId } },
        receivedRequests: { where: { senderId: profileId } },
        friendAsUser1: { where: { user2Id: profileId } },
        friendAsUser2: { where: { user1Id: profileId } },
      },
      take: 20,
    });

    const result = new GetSearchProfilesDto({
      profiles: profiles.map((profile) => {
        let status: 'FRIEND' | 'PENDING' | 'NONE' = 'NONE';

        if (profile.friendAsUser1.length > 0 || profile.friendAsUser2.length > 0) {
          status = 'FRIEND';
        } else {
          const allRequests = [...profile.sentRequests, ...profile.receivedRequests];
          const isPending = allRequests.some((req) => req.status === 'PENDING');
          if (isPending) status = 'PENDING';
        }

        return new SearchProfileDto({
          profileId: profile.id,
          name: profile.name,
          univ: profile.univ,
          profileImage: profile.profileImage,
          friendStatus: status,
        });
      }),
    });

    return result;
  }
}
