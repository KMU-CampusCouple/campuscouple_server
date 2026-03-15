import { Controller, Post, Get, Body, Headers, UseGuards, Req, Patch, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { BaseResponse } from '../../common/dto/base-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetMeetingsSummaryDto } from './dto/get-meetings-summary.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { GetSearchProfilesDto } from './dto/get-search-profiles-dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('profile')
  @ApiOperation({
    summary: '유저 프로필 등록',
    description: '인증된 사용자가 프로필 정보를 등록합니다.',
  })
  @ApiOkResponse({
    description: '프로필 등록 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: '프로필이 성공적으로 등록되었습니다.',
        },
        data: {
          type: 'object',
          properties: {
            userId: { type: 'number', example: 1 },
            profileId: { type: 'number', example: 1 },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: '잘못된 요청 데이터',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: '유효하지 않은 토큰입니다.' },
        data: { type: 'null' },
      },
    },
  })
  @ApiBearerAuth('JWT-auth')
  async createProfile(
    @Body() dto: CreateProfileDto,
    @Headers() headers: any,
  ): Promise<BaseResponse<{ userId: number; profileId: number }>> {
    try {
      // Bearer 토큰에서 tempToken 추출
      const token = headers?.authorization.replace('Bearer ', '');
      const result = await this.usersService.createProfile(dto, token);
      return new BaseResponse(true, '프로필이 성공적으로 등록되었습니다.', result);
    } catch (error) {
      return new BaseResponse(false, error.message) as any;
    }
  }

  @Get('me')
  @ApiOperation({
    summary: '내 프로필 조회',
    description: 'JWT 토큰으로 인증된 사용자의 프로필 정보를 조회합니다.',
  })
  @ApiOkResponse({
    description: '프로필 조회 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '프로필 조회 성공' },
        data: {
          type: 'object',
          properties: {
            userId: { type: 'number', example: 1 },
            name: { type: 'string', example: '홍길동' },
            univ: { type: 'string', example: '서울대학교' },
            profileImage: {
              type: 'string',
              example: 'https://example.com/image.jpg',
            },
            snsAccounts: {
              type: 'object',
              example: { insta: 'hong_gildong', kakao: 'hong' },
            },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: '잘못된 요청 데이터',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: '유효하지 않은 토큰입니다.' },
        data: { type: 'null' },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async getMyProfile(@Headers() headers: any): Promise<BaseResponse<any>> {
    try {
      // TODO: JWT에서 userId 추출
      const token = headers?.authorization.replace('Bearer ', '');
      const result = await this.usersService.getMyProfile(token);
      return new BaseResponse(true, '프로필 조회 성공', result);
    } catch (error) {
      return new BaseResponse(false, error.message) as any;
    }
  }

  @Patch('profile')
  @ApiOperation({
    summary: '내 프로필 수정',
    description: '내 프로필 정보를 선택적으로 수정합니다.',
  })
  @ApiOkResponse({
    description: '프로필 수정 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '프로필 수정 성공' },
        data: { type: 'null' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: '잘못된 요청 데이터',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: '유효하지 않은 토큰입니다.' },
        data: { type: 'null' },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async updateProfile(
    @Req() req: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<BaseResponse<any>> {
    try {
      const profileId = req.user.profile.id;
      await this.usersService.updateProfile(updateProfileDto, profileId);
      return new BaseResponse(true, '프로필 변경 성공', null);
    } catch (error) {
      return new BaseResponse(false, error.message) as any;
    }
  }

  @Get('me/meetings')
  @ApiExtraModels(GetMeetingsSummaryDto)
  @ApiOperation({
    summary: '내가 쓴 미팅글 조회',
    description: 'JWT 토큰으로 인증된 사용자가 작성한 미팅글을 조회합니다.',
  })
  @ApiOkResponse({
    description: '내가 쓴 미팅글 조회 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '내가 쓴 미팅글 조회 성공' },
        data: {
          type: 'array',
          items: {
            $ref: getSchemaPath(GetMeetingsSummaryDto),
          },
        },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async getMyMeetings(@Req() req: any): Promise<BaseResponse<GetMeetingsSummaryDto[]>> {
    try {
      const profileId = req.user.profile.id;
      const result = await this.usersService.getMyMeetings(profileId);
      return new BaseResponse(true, '내가 쓴 미팅글 조회 성공', result);
    } catch (error) {
      return new BaseResponse(false, error.message) as any;
    }
  }

  @Get('me/participations')
  @ApiExtraModels(GetMeetingsSummaryDto)
  @ApiOperation({
    summary: '내가 신청한 미팅글 조회',
    description: 'JWT 토큰으로 인증된 사용자가 신청한 미팅글을 조회합니다.',
  })
  @ApiOkResponse({
    description: '내가 신청한 미팅글 조회 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '내가 신청한 미팅글 조회 성공' },
        data: {
          type: 'array',
          items: {
            $ref: getSchemaPath(GetMeetingsSummaryDto),
          },
        },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async getMyParticipations(@Req() req: any): Promise<BaseResponse<GetMeetingsSummaryDto[]>> {
    try {
      const profileId = req.user.profile.id;
      const result = await this.usersService.getMyParticipations(profileId);
      return new BaseResponse(true, '내가 신청한 미팅글 조회 성공', result);
    } catch (error) {
      return new BaseResponse(false, error.message) as any;
    }
  }

  @Get('me/matched-meetings')
  @ApiExtraModels(GetMeetingsSummaryDto)
  @ApiOperation({
    summary: '매칭된 미팅글 조회',
    description: 'JWT 토큰으로 인증된 사용자가 매칭된 미팅글을 조회합니다.',
  })
  @ApiOkResponse({
    description: '매칭된 미팅글 조회 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '매칭된 미팅글 조회 성공' },
        data: {
          type: 'array',
          items: {
            $ref: getSchemaPath(GetMeetingsSummaryDto),
          },
        },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async getMyMatchedMeetings(@Req() req: any): Promise<BaseResponse<GetMeetingsSummaryDto[]>> {
    try {
      const profileId = req.user.profile.id;
      const result = await this.usersService.getMyMatchedMeetings(profileId);
      return new BaseResponse(true, '매칭된 미팅글 조회 성공', result);
    } catch (error) {
      return new BaseResponse(false, error.message) as any;
    }
  }

  @Get('search')
  @ApiExtraModels(GetSearchProfilesDto)
  @ApiOperation({
    summary: '프로필 검색',
    description: '사용자가 검색한 키워드를 바탕으로 유저 프로필을 검색합니다.',
  })
  @ApiOkResponse({
    description: '프로필 검색 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '프로필 검색 성공' },
        data: {
          type: 'array',
          items: {
            $ref: getSchemaPath(GetSearchProfilesDto),
          },
        },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async getSearchProfiles(
    @Param('keyword') keyword: string,
    @Req() req: any,
  ): Promise<BaseResponse<GetSearchProfilesDto>> {
    try {
      const profileId = req.user.profile.id;
      const result = await this.usersService.getSearchProfiles(profileId, keyword);
      return new BaseResponse(true, '프로필 검색 성공', result);
    } catch (error) {
      return new BaseResponse(false, error.message) as any;
    }
  }
}
