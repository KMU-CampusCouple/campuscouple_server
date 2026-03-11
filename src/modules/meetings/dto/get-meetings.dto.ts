import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { MeetingStatus } from '@prisma/client';

export class GetMeetingsDto {
  @ApiPropertyOptional({ description: '페이지 번호 (기본값: 1)', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: '한 페이지당 노출 개수 (기본값: 10)', example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ description: '모집 상태 필터', enum: MeetingStatus })
  @IsOptional()
  @IsEnum(MeetingStatus)
  status?: MeetingStatus;

  @ApiPropertyOptional({ description: '검색어 (제목 기준)', example: '공대생' })
  @IsOptional()
  @IsString()
  search?: string;
}
