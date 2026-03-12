import { ApiProperty } from '@nestjs/swagger';

// 작성자(유저) 정보 요약
class CreatorSummaryDto {
  @ApiProperty({ example: '이재영' })
  name: string;

  @ApiProperty({ example: '소프트웨어학부' })
  major: string;
}

// 개별 미팅 아이템 정보
export class MeetingItemDto {
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

  @ApiProperty({ example: 'OPEN', enum: ['OPEN', 'CLOSED'] })
  status: string;

  @ApiProperty({ example: '2026-03-09T15:00:00.000Z' })
  dateTime: string;

  @ApiProperty({ type: CreatorSummaryDto })
  creator: CreatorSummaryDto;

  constructor(partial: Partial<MeetingItemDto>) {
    Object.assign(this, partial);
  }
}

// 최종 응답 데이터 구조 (페이징 정보 포함)
export class MeetingListResponseDto {
  @ApiProperty({ type: [MeetingItemDto] })
  meetings: MeetingItemDto[];

  @ApiProperty({ example: 100, description: '전체 검색 결과 개수' })
  totalCount: number;

  @ApiProperty({ example: 1, description: '현재 페이지' })
  currentPage: number;

  @ApiProperty({ example: 10, description: '전체 페이지 수' })
  totalPages: number;

  constructor(partial: Partial<MeetingListResponseDto>) {
    Object.assign(this, partial);
  }
}
