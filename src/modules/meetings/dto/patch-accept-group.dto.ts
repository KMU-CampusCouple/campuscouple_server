import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AcceptGroupDto {
  @ApiProperty({ example: 10, description: '전체 페이지 수' })
  @IsString()
  groupId: string;

  constructor(partial: Partial<AcceptGroupDto>) {
    Object.assign(this, partial);
  }
}
