import { IsNotEmpty, IsString, IsOptional, IsEnum, IsArray } from 'class-validator';
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
}
