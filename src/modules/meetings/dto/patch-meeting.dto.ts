import { IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PatchMeetingDto {
  @ApiProperty({ description: '미팅 제목', example: '강남역 미팅!', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: '미팅 내용', example: '같이 밥먹어요~', required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ description: '미팅 장소', example: '강남역 2번 출구', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ description: '미팅 일시', example: '2026-04-01T18:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  dateTime?: string;
}
