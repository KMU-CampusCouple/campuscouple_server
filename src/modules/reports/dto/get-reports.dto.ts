import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ReportType } from '@prisma/client';

export class GetReportsQueryDto {
  @ApiPropertyOptional({ description: '페이지 번호 (기본값: 1)', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: '한 페이지당 개수 (기본값: 10)', example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: '신고 유형 필터',
    enum: ReportType,
    enumName: 'ReportType',
  })
  @IsOptional()
  @IsEnum(ReportType)
  type?: ReportType;
}
