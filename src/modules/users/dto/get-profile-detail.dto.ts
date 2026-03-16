import { IsString, IsNumber, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetProfileDetailDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  profileId: number;

  @ApiProperty({ example: '이재영' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'MALE', description: '성별', enum: ['MALE', 'FEMALE'] })
  @IsString()
  gender: string;

  @ApiProperty({ example: '국민대하교' })
  @IsString()
  univ: string;

  @ApiProperty({ example: '소프트웨어학부' })
  @IsString()
  major: string;

  @ApiProperty({ example: '20210001' })
  @IsString()
  studentId: string;

  @ApiProperty({ example: 'ESFP' })
  @IsString()
  mbti: string | null;

  @ApiProperty({ example: '안녕하세요!' })
  @IsString()
  intro: string | null;

  @ApiProperty({ example: '이재영', nullable: true })
  @IsString()
  snsAccounts: {
    insta?: string;
    kakao?: string;
    facebook?: string;
    twitter?: string;
    threads?: string;
    line?: string;
    telegram?: string;
  } | null;

  @ApiProperty({
    example: ['https://example.com/image.jpg', 'https://example.com/image.jpg'],
    nullable: true,
  })
  @IsArray()
  profileImages: string[];

  constructor(partial: Partial<GetProfileDetailDto>) {
    Object.assign(this, partial);
  }
}
