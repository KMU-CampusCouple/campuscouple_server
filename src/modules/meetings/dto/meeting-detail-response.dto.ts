import { ApiProperty } from '@nestjs/swagger';

// 작성자(유저) 정보 요약
class CreatorSummaryDto {
  @ApiProperty({ example: '코딩하는재영' })
  nickname: string;

  @ApiProperty({ example: '소프트웨어학부' })
  major: string;
}

// 미팅신청자 프로필 정보
class ProfileParticipantDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 2 })
  meetingId: number;

  @ApiProperty({ example: 3 })
  profileId: number;

  @ApiProperty({ example: 'PENDING' })
  status: string;
}

// 최종 응답 데이터 구조 (페이징 정보 포함)
export class MeetingDetailResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '공대생 3대3 미팅하실 분!' })
  title: string;

  @ApiProperty({ example: '정릉/혜화' })
  location: string;

  @ApiProperty({ example: 3, description: '미팅 인원 (N:N)' })
  memberCount: number;

  @ApiProperty({ example: 1, description: '현재 확정된 인원수' })
  currentCount: number;

  @ApiProperty({ example: 1, description: '대기중인 신청 갯수' })
  pendingGroupCount: number;

  @ApiProperty({ example: 'OPEN', enum: ['OPEN', 'CLOSED'] })
  status: string;

  @ApiProperty({ example: '2026-03-09T15:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ type: CreatorSummaryDto })
  creator: CreatorSummaryDto;

  @ApiProperty({ type: [ProfileParticipantDto] })
  participants?: ProfileParticipantDto[] | null;

  @ApiProperty({ example: 1, description: '해당 미팅글 생성자인지' })
  isOwner: boolean;

  constructor(partial: Partial<MeetingDetailResponseDto>) {
    Object.assign(this, partial);
  }
}
