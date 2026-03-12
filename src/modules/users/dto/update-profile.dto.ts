import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({
    description: '사용자 이름',
    example: '홍길동',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: '성별',
    enum: ['MALE', 'FEMALE'],
    example: 'MALE',
    required: false,
  })
  @IsEnum(['MALE', 'FEMALE'])
  @IsOptional()
  gender?: string;

  @ApiProperty({
    description: '대학교명',
    example: '서울대학교',
    required: false,
  })
  @IsString()
  @IsOptional()
  univ?: string;

  @ApiProperty({
    description: '전공',
    example: '컴퓨터공학',
    required: false,
  })
  @IsString()
  @IsOptional()
  major?: string;

  @ApiProperty({
    description: '학번',
    example: '20210001',
    required: false,
  })
  @IsString()
  @IsOptional()
  studentId?: string;

  @ApiProperty({
    description: 'MBTI 성격유형',
    example: 'ENFP',
    required: false,
  })
  @IsOptional()
  @IsString()
  mbti?: string;

  @ApiProperty({
    description: '거주 지역',
    example: '서울',
    required: false,
  })
  @IsString()
  @IsOptional()
  region?: string;

  @ApiProperty({
    description: '한줄 소개',
    example: '안녕하세요!',
    required: false,
  })
  @IsOptional()
  @IsString()
  intro?: string;

  @ApiProperty({
    description: 'SNS 계정 정보',
    example: {
      insta: 'hong_gildong',
      kakao: 'hong_gildong',
      facebook: 'hong.gildong',
      twitter: 'hong_gildong',
      threads: 'hong_gildong',
      line: 'hong_gildong',
      telegram: 'hong_gildong',
    },
    required: false,
  })
  @IsOptional()
  snsAccounts?: {
    insta?: string;
    kakao?: string;
    facebook?: string;
    twitter?: string;
    threads?: string;
    line?: string;
    telegram?: string;
  };

  @ApiProperty({
    description: '프로필 이미지 URL',
    example: 'https://example.com/image.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  profileImage?: string;
}
