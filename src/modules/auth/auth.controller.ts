import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SendVerificationDto } from './dto/send-verification.dto';
import { ConfirmVerificationDto } from './dto/confirm-verification.dto';
import { LoginDto } from './dto/login.dto';
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
  async confirmVerificationCode(
    @Body() dto: ConfirmVerificationDto,
  ): Promise<BaseResponse<{ tempToken: string }>> {
    try {
      const result = await this.authService.confirmVerificationCode(dto);
      return new BaseResponse(true, '인증이 완료되었습니다.', result);
    } catch (error) {
      return new BaseResponse(false, error.message) as any;
    }
  }

  @Post('login')
  @ApiOperation({
    summary: '로그인',
    description: '이메일과 비밀번호로 로그인하여 JWT 토큰을 반환합니다.',
  })
  @ApiOkResponse({
    description: '로그인 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '로그인 성공' },
        data: {
          type: 'object',
          properties: {
            access_token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: '잘못된 자격 증명',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: '잘못된 비밀번호입니다.' },
        data: { type: 'null' },
      },
    },
  })
  async login(@Body() dto: LoginDto): Promise<BaseResponse<{ access_token: string }>> {
    try {
      const result = await this.authService.login(dto);
      return new BaseResponse(true, '로그인 성공', result);
    } catch (error) {
      return new BaseResponse(false, error.message) as any;
    }
  }
}
