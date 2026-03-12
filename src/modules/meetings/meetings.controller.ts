import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { MeetingsService } from './meetings.service';
import { GetMeetingsDto } from './dto/get-meetings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BaseResponse } from 'src/common/dto/base-response.dto';
import { MeetingListResponseDto } from './dto/meeting-list-response.dto';
import { MeetingDetailResponseDto } from './dto/meeting-detail-response.dto';
import { PostMeetingRequestDto, PostMeetingResponseDto } from './dto/post-meeting.dto';
import { PostMeetingParticipationDto } from './dto/post-meeting-participantation.dto';
import { AcceptGroupDto } from './dto/patch-accept-group.dto';

@ApiTags('Meetings')
@Controller('meetings')
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Get()
  @ApiExtraModels(MeetingListResponseDto)
  @ApiOperation({
    summary: '전체 미팅 모집글 조회',
    description: '사용자들이 생성한 전체 미팅글을 조회합니다.',
  })
  @ApiOkResponse({
    description: '전체 미팅글 조회 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '미팅글을 성공적으로 조회하였습니다.' },
        data: {
          $ref: getSchemaPath(MeetingListResponseDto),
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: '잘못된 요청 파라미터 또는 조회 실패',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: '유효하지 않은 조회 조건입니다.' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async getMeetings(
    @Query() getMeetingsDto: GetMeetingsDto,
    @Headers() headers: any,
  ): Promise<BaseResponse<MeetingListResponseDto>> {
    try {
      const token = headers?.authorization.replace('Bearer ', '');
      const result = await this.meetingsService.getMeetings(getMeetingsDto, token);
      return new BaseResponse(true, '전체 미팅글 조회 성공', result);
    } catch (error) {
      return new BaseResponse(false, error.message) as any;
    }
  }

  @Get(':id')
  @ApiExtraModels(MeetingDetailResponseDto)
  @ApiOperation({
    summary: '미팅 모집글 디테일 조회',
    description: '사용자들이 생성한 미팅글을 조회합니다.',
  })
  @ApiOkResponse({
    description: '미팅글 조회 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '미팅글을 성공적으로 조회하였습니다.' },
        data: {
          $ref: getSchemaPath(MeetingDetailResponseDto),
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: '잘못된 요청 파라미터 또는 조회 실패',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: '유효하지 않은 조회 조건입니다.' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async getMeetingDetail(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ): Promise<BaseResponse<MeetingDetailResponseDto>> {
    try {
      const userId: number = req.user.id;
      const result = await this.meetingsService.getMeetingDetail(id, userId);
      return new BaseResponse(true, '미팅글 조회 성공', result);
    } catch (error) {
      return new BaseResponse(false, error.message) as any;
    }
  }

  @Delete(':id')
  @ApiOperation({
    summary: '미팅글 삭제',
    description: '방장 권한이 있는 경우에만 미팅글을 삭제합니다.',
  })
  @ApiOkResponse({
    schema: {
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '미팅글이 삭제되었습니다.' },
        data: { type: 'object', example: null, nullable: true },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async deleteMeeting(
    @Param('id', ParseIntPipe) meetingId: number,
    @Req() req: any,
  ): Promise<BaseResponse<any>> {
    try {
      const profileId = req.user.profile.id;
      await this.meetingsService.deleteMeeting(meetingId, profileId);
      return new BaseResponse(true, '미팅글이 삭제되었습니다.', null);
    } catch (error) {
      return new BaseResponse(false, error.message) as any;
    }
  }

  @Post()
  @ApiExtraModels(PostMeetingResponseDto)
  @ApiOperation({
    summary: '미팅 모집글 생성',
    description: '사용자가 미팅 모집글을 생성합니다.',
  })
  @ApiOkResponse({
    description: '미팅글 생성 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '미팅글을 성공적으로 생성하였습니다.' },
        data: {
          $ref: getSchemaPath(PostMeetingResponseDto),
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: '잘못된 요청 파라미터 또는 조회 실패',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: '유효하지 않은 조회 조건입니다.' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async postMeeting(
    @Body() postMeetingRequestDto: PostMeetingRequestDto,
    @Headers() headers: any,
  ): Promise<BaseResponse<PostMeetingResponseDto>> {
    try {
      const token = headers?.authorization.replace('Bearer ', '');
      const result = await this.meetingsService.postMeeting(postMeetingRequestDto, token);
      return new BaseResponse(true, '미팅글 생성 성공', result);
    } catch (error) {
      return new BaseResponse(false, error.message) as any;
    }
  }

  @Post('participation')
  @ApiOperation({
    summary: '미팅 신청',
    description: '사용자가 미팅에 신청합니다.',
  })
  @ApiOkResponse({
    description: '미팅 신청 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '미팅글을 성공적으로 생성하였습니다.' },
        data: { type: 'object', nullable: true, example: null },
      },
    },
  })
  @ApiBadRequestResponse({
    description: '잘못된 요청 파라미터 또는 조회 실패',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: '유효하지 않은 조회 조건입니다.' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async postMeetingParticipantion(
    @Body() postMeetingParticipantion: PostMeetingParticipationDto,
    @Headers() headers: any,
  ): Promise<BaseResponse<any>> {
    try {
      const token = headers?.authorization.replace('Bearer ', '');
      await this.meetingsService.postMeetingParticipation(postMeetingParticipantion, token);
      return new BaseResponse(true, '미팅글 생성 성공', null);
    } catch (error) {
      return new BaseResponse(false, error.message) as any;
    }
  }

  @Patch(':id/accept_group')
  @ApiOperation({
    summary: '미팅 신청 그룹 승인',
    description: '미팅에 신청한 그룹을 승인합니다.',
  })
  @ApiOkResponse({
    description: '그룹 신청 승인 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '그룹 신청 승인을 성공적으로 완료하였습니다.' },
        data: { type: 'object', nullable: true, example: null },
      },
    },
  })
  @ApiBadRequestResponse({
    description: '잘못된 요청 파라미터 또는 조회 실패',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: '유효하지 않은 조회 조건입니다.' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async acceptGroup(
    @Param('id', ParseIntPipe) meetingId: number,
    @Body() acceptDto: AcceptGroupDto,
    @Req() req: any,
  ): Promise<BaseResponse<any>> {
    try {
      const profileId: number = req.user.profile.id;
      await this.meetingsService.acceptParticipantGroup(meetingId, acceptDto.groupId, profileId);
      return new BaseResponse(true, '그룹 신청 승인 성공', null);
    } catch (error) {
      return new BaseResponse(false, error.message) as any;
    }
  }
}
