import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ReportType } from '@prisma/client';

export class CreateReportDto {
  @ApiProperty({
    description: '신고 유형',
    enum: ReportType,
    enumName: 'ReportType',
    example: 'BUG',
    examples: ['BUG', 'SUGGESTION'],
  })
  @IsEnum(ReportType)
  @IsNotEmpty()
  type: ReportType;

  @ApiProperty({
    description: '신고/건의 제목',
    example: '로그인 시 앱이 종료됩니다',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: '신고/건의 상세 내용',
    example: '카카오 로그인 버튼을 누르면 앱이 강제 종료되는 현상이 반복됩니다.',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
