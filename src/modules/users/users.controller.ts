import { Controller, Post, Get, Body, Headers, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { BaseResponse } from '../../common/dto/base-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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
  async createProfile(
    @Body() dto: CreateProfileDto,
    @Headers('authorization') tempToken: string,
  ): Promise<BaseResponse<{ userId: number; profileId: number }>> {
    try {
      // Bearer 토큰에서 tempToken 추출
      const token = tempToken?.replace('Bearer ', '');
      const result = await this.usersService.createProfile(dto, token);
      return new BaseResponse(true, '프로필이 성공적으로 등록되었습니다.', result);
    } catch (error) {
      return new BaseResponse(false, error.message) as any;
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
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
  @ApiUnauthorizedResponse({
    description: 'JWT 토큰 필요 또는 토큰 유효하지 않음',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Unauthorized' },
        data: { type: 'null' },
      },
    },
  })
  async getMyProfile(): Promise<BaseResponse<any>> {
    try {
      // TODO: JWT에서 userId 추출
      const userId = 1; // 임시
      const result = await this.usersService.getMyProfile(userId);
      return new BaseResponse(true, '프로필 조회 성공', result);
    } catch (error) {
      return new BaseResponse(false, error.message) as any;
    }
  }
}
