import { IsString, IsNumber, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// 미팅신청자 프로필 정보
export class FriendProfileDto {
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

  constructor(partial: Partial<FriendProfileDto>) {
    Object.assign(this, partial);
  }
}

export class GetFriendsListDto {
  @ApiProperty({ type: [FriendProfileDto] })
  @IsArray()
  profiles?: FriendProfileDto[] | null;

  constructor(partial: Partial<GetFriendsListDto>) {
    Object.assign(this, partial);
  }
}
