import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SendVerificationDto } from './dto/send-verification.dto';
import { ConfirmVerificationDto } from './dto/confirm-verification.dto';
import { BaseResponse } from '../../common/dto/base-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('verify-email/send')
  async sendVerificationCode(@Body() dto: SendVerificationDto): Promise<BaseResponse<null>> {
    try {
      const result = await this.authService.sendVerificationCode(dto);
      return new BaseResponse(true, result.message, null);
    } catch (error) {
      return new BaseResponse(false, error.message) as any;
    }
  }

  @Post('verify-email/confirm')
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
}
