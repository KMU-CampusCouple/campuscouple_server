import { IsString, IsNumber, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetMeetingsSummaryDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  id: number;

  @ApiProperty({ example: '공대생 3대3 미팅하실 분!' })
  @IsString()
  title: string;

  @ApiProperty({ example: 3, description: '미팅 인원 (N:N)' })
  @IsNumber()
  memberCount: number;

  @ApiProperty({ example: 1, description: '현재 확정된 인원수' })
  @IsNumber()
  currentCount: number;

  constructor(partial: Partial<GetMeetingsSummaryDto>) {
    Object.assign(this, partial);
  }
}
