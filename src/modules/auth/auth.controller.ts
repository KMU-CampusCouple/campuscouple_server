import { Controller, Post, Body, UseGuards, Headers } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SendVerificationDto } from './dto/send-verification.dto';
import { ConfirmVerificationDto } from './dto/confirm-verification.dto';
import { LoginDto } from './dto/login.dto';
import { TossLoginDto } from './dto/toss-login.dto';
import { BaseResponse } from '../../common/dto/base-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('verify-email/send')
  @ApiOperation({
    summary: '학교 이메일 인증 코드 발송',
    description: '학교 이메일로 6자리 인증 코드를 발송합니다.',
  })
  @ApiOkResponse({
    description: '인증 코드 발송 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '인증 코드가 발송되었습니다.' },
        data: { type: 'null' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: '잘못된 이메일 또는 이미 등록된 사용자',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: '학교 이메일만 사용 가능합니다.' },
        data: { type: 'null' },
      },
    },
  })
  async sendVerificationCode(@Body() dto: SendVerificationDto): Promise<BaseResponse<null>> {
    try {
      const result = await this.authService.sendVerificationCode(dto);
      return new BaseResponse(true, result.message, null);
    } catch (error) {
      return new BaseResponse(false, error.message) as any;
    }
  }

  @Post('verify-email/confirm')
  @ApiOperation({
    summary: '인증 코드 검증',
    description: '사용자가 입력한 인증 코드를 검증하고 임시 토큰을 반환합니다.',
  })
  @ApiOkResponse({
    description: '인증 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '인증이 완료되었습니다.' },
        data: {
          type: 'object',
          properties: {
            tempToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: '잘못된 코드 또는 만료됨',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: '잘못된 인증 코드입니다.' },
        data: { type: 'null' },
      },
    },
  })
  @ApiBearerAuth('JWT-auth')
  async confirmVerificationCode(
    @Body() dto: ConfirmVerificationDto,
    @Headers() headers: any,
  ): Promise<BaseResponse<{ tempToken: string }>> {
    try {
      const token = headers?.authorization.replace('Bearer ', '');
      const result = await this.authService.confirmVerificationCode(dto, token);
      return new BaseResponse(true, '인증이 완료되었습니다.', result);
    } catch (error) {
      return new BaseResponse(false, error.message) as any;
    }
  }

  @Post('toss-login')
  @ApiOperation({
    summary: '토스 로그인',
    description: '토스 authorization code로 로그인하여 JWT 토큰을 반환합니다.',
  })
  @ApiOkResponse({
    description: '토스 로그인 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '토스 로그인 성공' },
        data: {
          type: 'object',
          properties: {
            access_token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: '토스 로그인 실패',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: '토스 로그인에 실패했습니다.' },
        data: { type: 'null' },
      },
    },
  })
  async tossLogin(@Body() dto: TossLoginDto): Promise<BaseResponse<{ access_token: string }>> {
    try {
      const result = await this.authService.tossLogin(dto);
      return new BaseResponse(true, '토스 로그인 성공', result);
    } catch (error) {
      return new BaseResponse(false, error.message) as any;
    }
  }
}
