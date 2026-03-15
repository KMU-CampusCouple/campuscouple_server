import { IsString, IsNumber, IsArray, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// 미팅신청자 프로필 정보
export class SearchProfileDto {
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

  @ApiProperty({ example: 'FRIEND' })
  @IsEnum(['FRIEND', 'PENDING', 'NONE'])
  friendStatus: string;

  constructor(partial: Partial<SearchProfileDto>) {
    Object.assign(this, partial);
  }
}

export class GetSearchProfilesDto {
  @ApiProperty({ type: [SearchProfileDto] })
  @IsArray()
  profiles?: SearchProfileDto[] | null;

  constructor(partial: Partial<GetSearchProfilesDto>) {
    Object.assign(this, partial);
  }
}
