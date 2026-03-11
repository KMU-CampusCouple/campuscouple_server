import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsString } from 'class-validator';

export class PostMeetingParticipationDto {
  @ApiPropertyOptional({ description: '참가할 미팅 ID', example: 2 })
  @Type(() => Number)
  @IsInt()
  meetingId: number;

  @ApiPropertyOptional({ description: '참가자 프로필 아이디', example: [1, 2, 3] })
  @Type(() => Array)
  @IsArray()
  participantIds: number[];

  @ApiPropertyOptional({ description: '그룹 소개글', example: '저희는 국민대학교 학생들입니다!' })
  @Type(() => String)
  @IsString()
  description: string;
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
