import { IsString, IsNumber, IsArray, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RespondFriendRequestDto {
  @ApiProperty({
    description: '수락 또는 거절 액션',
    enum: ['ACCEPT', 'REJECT'],
    example: 'ACCEPT',
  })
  @IsEnum(['ACCEPT', 'REJECT'])
  action: 'ACCEPT' | 'REJECT';
}

// 미팅신청자 프로필 정보
export class FriendRequestDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  requestId: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  profileId: number;

  @ApiProperty({ example: '이재영' })
  @IsString()
  name: string;

  @ApiProperty({ example: '국민대학교' })
  @IsString()
  univ: string;

  @ApiProperty({ example: 'https://example.com/image.jpg' })
  @IsString()
  profileImage: string | null;

  constructor(partial: Partial<FriendRequestDto>) {
    Object.assign(this, partial);
  }
}

export class GetFriendRequestsDto {
  @ApiProperty({ type: [FriendRequestDto] })
  @IsArray()
  profiles?: FriendRequestDto[] | null;

  constructor(partial: Partial<GetFriendRequestsDto>) {
    Object.assign(this, partial);
  }
}
