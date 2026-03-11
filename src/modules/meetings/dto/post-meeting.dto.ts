import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDate, IsInt, IsString } from 'class-validator';

export class PostMeetingRequestDto {
  @ApiPropertyOptional({ description: '미팅글 제목', example: '제목' })
  @Type(() => String)
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: '모집 인원수', example: 6 })
  @Type(() => Number)
  @IsInt()
  capacity: number;

  @ApiPropertyOptional({ description: '참가자 프로필 아이디', example: [1, 2, 3] })
  @Type(() => Array)
  @IsArray()
  participantIds: number[];

  @ApiPropertyOptional({ description: '미팅글 설명', example: '설명글' })
  @Type(() => String)
  @IsString()
  description: string;

  @ApiPropertyOptional({ description: '미팅 지역', example: '서울' })
  @Type(() => String)
  @IsString()
  location: string;

  @ApiPropertyOptional({ description: '미팅 시간', example: '2026-03-09T15:00:00.000Z' })
  @Type(() => Date)
  @IsDate()
  dateTime: Date;
}

export class PostMeetingResponseDto {
  @ApiPropertyOptional({ description: '생성된 미팅글 아이디', example: 6 })
  @Type(() => Number)
  @IsInt()
  meetingId: number;

  constructor(partial: Partial<PostMeetingResponseDto>) {
    Object.assign(this, partial);
  }
}
