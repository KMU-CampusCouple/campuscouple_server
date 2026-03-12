import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AcceptGroupDto {
  @ApiProperty({ example: 'e1b49ff8-9ae9-438f-b522-7849130ce10d', description: '전체 페이지 수' })
  @IsString()
  groupId: string;

  constructor(partial: Partial<AcceptGroupDto>) {
    Object.assign(this, partial);
  }
}
