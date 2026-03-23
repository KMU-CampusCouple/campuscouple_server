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
import { S3Service } from 'src/common/services/s3.service';
import { GetProfileDetailDto } from './dto/get-profile-detail.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private s3Service: S3Service,
  ) {}

  async createProfile(
    createProfileDto: CreateProfileDto,
    tempToken: string,
    files: Express.Multer.File[],
  ) {
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

    // 프로필 이미지 업로드 (최대 6개)
    let profileImages: string[] = [];
    if (files && files.length > 0) {
      if (files.length > 6) {
        throw new BadRequestException('프로필 이미지는 최대 6개까지 가능합니다.');
      }
      profileImages = await this.uploadProfileImages(files);
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
            profileImages: profileImages,
            representativeImageIndex: createProfileDto.representativeImageIndex ?? 0,
            primaryContact: createProfileDto.primaryContact ?? null,
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
      profileImage: user.profile.profileImages || null,
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

  async uploadProfileImages(files: Express.Multer.File[]): Promise<string[]> {
    const urls: string[] = [];
    for (const file of files) {
      const url = await this.s3Service.uploadFile(file);
      urls.push(url);
    }
    return urls;
  }
  async getMyMeetings(profileId: number) {
    const meetings = await this.prisma.meeting.findMany({
      where: { creatorId: profileId },
      include: {
        participants: {
          include: {
            profile: {
              select: { profileImages: true },
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
                  select: { profileImages: true },
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
                  select: { profileImages: true },
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
          profileImage: profile.profileImages[0] || null,
          friendStatus: status,
        });
      }),
    });

    return result;
  }

  async getProfileDetail(profileId: number) {
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
    });

    if (!profile) throw new NotFoundException('해당 프로필은 찾을 수 없어요.');

    return new GetProfileDetailDto({
      profileId: profile.id,
      name: profile.name,
      gender: profile.gender,
      univ: profile.univ,
      major: profile.major,
      studentId: profile.studentId,
      mbti: profile.mbti,
      intro: profile.intro,
      snsAccounts: profile.snsAccounts as any,
      profileImages: profile.profileImages,
      representativeImageIndex: profile.representativeImageIndex,
      primaryContact: profile.primaryContact,
    });
  }
}
