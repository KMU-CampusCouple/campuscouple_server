import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PostRequestFriendDto {
  @ApiProperty({
    description: '친구 추가를 보낼 profile Id',
    example: 3,
  })
  @IsNumber()
  @IsNotEmpty()
  receiverId: number;
}
