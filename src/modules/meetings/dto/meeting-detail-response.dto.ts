import { ApiProperty } from '@nestjs/swagger';

// 작성자(유저) 정보 요약
class CreatorSummaryDto {
  @ApiProperty({ example: '이재영' })
  name: string;

  @ApiProperty({ example: '소프트웨어학부' })
  major: string;
}

// 신청자 정보 요약
class ParticipantSummaryDto {
  @ApiProperty({ example: '이재영' })
  name: string;

  @ApiProperty({ example: '소프트웨어학부' })
  major: string;

  @ApiProperty({ example: 'https://example.com/image.jpg' })
  profileImage: string | null;
}

// 미팅신청자 프로필 정보
export class ProfileParticipantDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 2 })
  meetingId: number;

  @ApiProperty({ example: 3 })
  profileId: number;

  @ApiProperty({ example: 'PENDING' })
  status: string;

  @ApiProperty({ example: 'https://example.com/image.jpg' })
  profile: ParticipantSummaryDto;

  constructor(partial: Partial<ProfileParticipantDto>) {
    Object.assign(this, partial);
  }
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
  dateTime: string;

  @ApiProperty({ type: CreatorSummaryDto })
  creator: CreatorSummaryDto;

  @ApiProperty({
    type: [ProfileParticipantDto],
    nullable: true,
    description: 'isOwner가 true일 경우에만 데이터가 포함되며, 일반 유저에게는 null이 반환됩니다.',
  })
  participants?: ProfileParticipantDto[] | null;

  @ApiProperty({ example: true, description: '해당 미팅글 생성자인지' })
  isOwner: boolean;

  constructor(partial: Partial<MeetingDetailResponseDto>) {
    Object.assign(this, partial);
  }
}
