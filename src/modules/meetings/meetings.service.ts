import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetMeetingsDto } from './dto/get-meetings.dto';
import { MeetingStatus } from '@prisma/client';
import { MeetingListResponseDto } from './dto/meeting-list-response.dto';
import { MeetingDetailResponseDto } from './dto/meeting-detail-response.dto';
import { PostMeetingRequestDto, PostMeetingResponseDto } from './dto/post-meeting.dto';
import { PostMeetingParticipationDto } from './dto/post-meeting-participantation.dto';
import { v4 } from 'uuid';

@Injectable()
export class MeetingsService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async getMeetings(getMeetingsDto: GetMeetingsDto, token: string) {
    let payload: any;

    try {
      payload = this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }

    if (!payload.tossUserKey || !payload.sub) {
      throw new UnauthorizedException('인증되지 않은 토큰입니다.');
    }

    const { page = 1, limit = 10, search, status } = getMeetingsDto;
    const skip = (page - 1) * limit;

    // 2. 정렬 조건(OrderBy) 동적 구성
    const orderBy: any = { createdAt: 'desc' }; // 기본값: 최신순

    // if (sortBy === 'popular') {
    //   // 인기순: 참여자 수 기준 내림차순
    //   orderBy = { participants: { _count: 'desc' } };
    // }

    // 3. Prisma 쿼리 실행
    // 전체 개수와 목록을 동시에 가져오기 위해 트랜잭션 권장
    const [totalCount, meetings] = await this.prisma.$transaction([
      this.prisma.meeting.count({
        where: {
          status: status || MeetingStatus.OPEN, // 기본적으로 모집 중인 글만 조회
          OR: search
            ? [
                { title: { contains: search, mode: 'insensitive' } },
                // { content: { contains: search, mode: 'insensitive' } },
              ]
            : undefined,
        },
      }),
      this.prisma.meeting.findMany({
        where: {
          status: status || MeetingStatus.OPEN,
          OR: search
            ? [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
              ]
            : undefined,
        },
        include: {
          creator: {
            select: {
              name: true,
              major: true,
            },
          },
          _count: {
            select: { participants: true }, // 현재 참여 인원수 확인용
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    const meetingItems = meetings.map((m) => ({
      id: m.id,
      title: m.title,
      location: m.location,
      memberCount: m.capacity,
      status: m.status,
      createdAt: m.createdAt,
      creator: {
        nickname: m.creator.name,
        major: m.creator.major,
      },
    }));

    return new MeetingListResponseDto({
      meetings: meetingItems,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
    });
  }

  async getMeetingDetail(id: number, userId: number) {
    const userProfile = await this.prisma.profile.findUnique({
      where: { userId: userId },
      select: { id: true },
    });

    if (!userProfile) throw new NotFoundException('프로필을 찾을 수 없습니다.');

    const currentProfileId = userProfile.id; // 현재 접속 유저 ID

    const meeting = await this.prisma.meeting.findUnique({
      where: { id: id },
      include: {
        participants: {
          include: {
            profile: {
              select: { name: true, major: true },
            },
          },
        },
        creator: {
          select: {
            name: true,
            major: true,
          },
        },
        _count: {
          select: {
            participants: { where: { status: 'ACCEPTED' } },
          },
        },
      },
    });

    if (!meeting) {
      throw new NotFoundException(`${id}에 대한 미팅글을 찾을 수 없습니다.`);
    }

    // 3. 방장(Owner) 여부 확인
    const isOwner = meeting.creatorId === currentProfileId;

    // 4. 권한에 따른 참여자 데이터 가공
    let pendingGroupCount = 0;

    const pendingGroups = new Set(
      meeting.participants.filter((p) => p.status === 'PENDING' && p.groupId).map((p) => p.groupId),
    );
    pendingGroupCount = pendingGroups.size;

    return new MeetingDetailResponseDto({
      id: meeting.id,
      title: meeting.title,
      location: meeting.location,
      memberCount: meeting.capacity,
      currentCount: meeting._count.participants,
      pendingGroupCount: pendingGroupCount,
      status: meeting.status,
      createdAt: meeting.createdAt,
      creator: {
        nickname: meeting.creator.name,
        major: meeting.creator.major,
      },
      participants: isOwner ? meeting.participants : null,
      isOwner: isOwner,
    });
  }

  async deleteMeeting(meetingId: number, profileId: number) {
    await this.prisma.$transaction(async (tx) => {
      const meeting = await tx.meeting.findUnique({
        where: { id: meetingId },
        select: { creatorId: true },
      });

      if (!meeting) {
        throw new NotFoundException(`${meetingId}번 미팅을 찾을 수 없습니다.`);
      }

      if (meeting.creatorId !== profileId) {
        throw new ForbiddenException('삭제 권한이 없습니다.');
      }

      await tx.meetingParticipant.deleteMany({
        where: { meetingId: meetingId },
      });

      await tx.meeting.delete({
        where: { id: meetingId },
      });
    });
  }

  async postMeeting(postMeetingRequestDto: PostMeetingRequestDto, token: string) {
    let payload: any;

    try {
      payload = this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }

    if (!payload.tossUserKey || !payload.sub) {
      throw new UnauthorizedException('인증되지 않은 토큰입니다.');
    }

    const { title, capacity, participantIds, description, location, dateTime } =
      postMeetingRequestDto;

    const profile = await this.prisma.profile.findUnique({
      where: { userId: payload.sub },
    });

    if (!profile) {
      throw new NotFoundException(`${payload.sub}에 대한 프로필을 찾을 수 없습니다.`);
    }

    const uuid = v4();

    const meeting = await this.prisma.meeting.create({
      data: {
        title: title,
        capacity: capacity,
        content: description,
        location: location,
        dateTime: dateTime,
        creatorId: profile.id,
        participants: {
          create: participantIds.map((pid) => ({
            profile: {
              connect: { id: pid },
            },
            status: 'ACCEPTED',
            groupId: uuid,
          })),
        },
      },
    });

    return new PostMeetingResponseDto({
      meetingId: meeting.id,
    });
  }

  async postMeetingParticipation(
    postMeetingParticipationDto: PostMeetingParticipationDto,
    token: string,
  ) {
    let payload: any;

    try {
      payload = this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }

    if (!payload.tossUserKey || !payload.sub) {
      throw new UnauthorizedException('인증되지 않은 토큰입니다.');
    }

    const { meetingId, participantIds, description } = postMeetingParticipationDto;

    await this.prisma.$transaction(async (tx) => {
      const meeting = await tx.meeting.findUnique({
        where: { id: meetingId },
        include: {
          _count: {
            select: {
              participants: {
                where: { status: 'ACCEPTED' },
              },
            },
          },
        },
      });

      if (!meeting) throw new NotFoundException(`${meetingId}에 대한 미팅을 찾을 수 없습니다.`);

      const currentCount = meeting._count.participants;
      const incomingCount = participantIds.length;

      if (currentCount + incomingCount > meeting.capacity) {
        throw new BadRequestException(
          `인원이 초과되었습니다. (남은 자리: ${meeting.capacity - currentCount}명)`,
        );
      }

      const existingParticipants = await tx.meetingParticipant.findMany({
        where: {
          meetingId,
          profileId: { in: participantIds },
        },
        select: { profileId: true },
      });

      if (existingParticipants.length > 0) {
        const duplicateIds = existingParticipants.map((p) => p.profileId).join(', ');
        throw new BadRequestException(`이미 신청한 유저(ID: ${duplicateIds})가 포함되어 있습니다.`);
      }

      const groupId = v4();
      await tx.meetingParticipant.createMany({
        data: participantIds.map((pid) => ({
          meetingId: meetingId,
          profileId: pid,
          groupId: groupId,
          status: 'PENDING',
          description: description,
        })),
      });
    });

    return true;
  }

  async acceptParticipantGroup(meetingId: number, groupId: string, profileId: number) {
    await this.prisma.$transaction(async (tx) => {
      const meeting = await tx.meeting.findUnique({
        where: { id: meetingId },
        include: { _count: { select: { participants: { where: { status: 'ACCEPTED' } } } } },
      });

      if (meeting?.creatorId !== profileId) throw new ForbiddenException('승인 권한이 없습니다.');

      const groupParticipants = await tx.meetingParticipant.findMany({
        where: { meetingId, groupId, status: 'PENDING' },
      });

      const incomingCount = groupParticipants.length;

      if (meeting._count.participants + incomingCount > meeting.capacity) {
        throw new BadRequestException('수락 시 최대 인원을 초과합니다.');
      }

      await tx.meetingParticipant.updateMany({
        where: { meetingId, groupId },
        data: { status: 'ACCEPTED' },
      });

      if (meeting._count.participants + incomingCount === meeting.capacity) {
        await tx.meeting.update({
          where: { id: meetingId },
          data: { status: 'CLOSED' },
        });
      }
    });
  }
}
