import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ReportType } from '@prisma/client';

export class GetReportDto {
  @ApiProperty({ description: '신고/건의 ID', example: 1 })
  @Type(() => Number)
  id: number;

  @ApiProperty({
    description: '신고 유형',
    enum: ReportType,
    enumName: 'ReportType',
    example: 'BUG',
  })
  type: ReportType;

  @ApiProperty({ description: '제목', example: '로그인 시 앱이 종료됩니다' })
  title: string;

  @ApiProperty({
    description: '상세 내용',
    example: '카카오 로그인 버튼을 누르면 앱이 강제 종료되는 현상이 반복됩니다.',
  })
  content: string;

  @ApiProperty({ description: '작성일시', example: '2026-03-18T12:00:00.000Z' })
  createdAt: Date;

  constructor(partial: Partial<GetReportDto>) {
    Object.assign(this, partial);
  }
}
