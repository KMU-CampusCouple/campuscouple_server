import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProfileDto {
  @ApiProperty({
    description: '사용자 이름',
    example: '홍길동',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: '성별',
    enum: ['MALE', 'FEMALE'],
    example: 'MALE',
    required: true,
  })
  @IsEnum(['MALE', 'FEMALE'])
  gender: string;

  @ApiProperty({
    description: '대학교명',
    example: '서울대학교',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  univ: string;

  @ApiProperty({
    description: '전공',
    example: '컴퓨터공학',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  major: string;

  @ApiProperty({
    description: '학번',
    example: '20210001',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  studentId: string;

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
  region: string;

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
    example: { insta: 'hong_gildong', kakao: 'hong' },
    required: false,
  })
  @IsOptional()
  snsAccounts?: { [key: string]: string };

  @ApiProperty({
    description: '프로필 이미지 URL',
    example: 'https://example.com/image.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  profileImage?: string;
}
