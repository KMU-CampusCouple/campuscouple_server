import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { BaseResponse } from 'src/common/dto/base-response.dto';
import { CreateReportDto } from './dto/create-report.dto';
import { GetReportDto } from './dto/get-report.dto';
import { GetReportsQueryDto } from './dto/get-reports.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @ApiOperation({
    summary: '버그 신고 / 건의사항 작성',
    description: '버그 신고(BUG) 또는 기능/서비스 건의(SUGGESTION)를 작성합니다.',
  })
  @ApiExtraModels(GetReportDto)
  @ApiOkResponse({
    description: '신고/건의 작성 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '신고/건의를 등록했어요.' },
        data: { $ref: getSchemaPath(GetReportDto) },
      },
    },
  })
  @ApiBadRequestResponse({
    description: '유효성 검증 실패',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: '입력 내용을 확인해 주세요.' },
        data: { type: 'null' },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async createReport(
    @Body() createReportDto: CreateReportDto,
    @Req() req: any,
  ): Promise<BaseResponse<GetReportDto>> {
    try {
      const userId = req.user.id;
      const result = await this.reportsService.createReport(userId, createReportDto);
      return new BaseResponse(true, '신고/건의를 등록했어요.', result);
    } catch (error) {
      return new BaseResponse(false, error.message) as any;
    }
  }

  @Get()
  @ApiOperation({
    summary: '내 신고/건의 목록 조회',
    description:
      '내가 작성한 버그 신고 및 건의사항 목록을 조회합니다. 유형별 필터링과 페이지네이션을 지원합니다.',
  })
  @ApiExtraModels(GetReportDto)
  @ApiOkResponse({
    description: '신고/건의 목록을 불러왔어요.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '신고/건의 목록을 불러왔어요.' },
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(GetReportDto) },
        },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async getMyReports(
    @Req() req: any,
    @Query() query: GetReportsQueryDto,
  ): Promise<BaseResponse<GetReportDto[]>> {
    try {
      const userId = req.user.id;
      const result = await this.reportsService.getMyReports(userId, query);
      return new BaseResponse(true, '신고/건의 목록을 불러왔어요.', result);
    } catch (error) {
      return new BaseResponse(false, error.message) as any;
    }
  }
}
