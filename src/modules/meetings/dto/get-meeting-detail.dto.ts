import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class GetMeetingDetailDto {
  @ApiPropertyOptional({ description: '미팅글 id', example: 1 })
  @Type(() => Number)
  @IsInt()
  id: number = 1;
}
