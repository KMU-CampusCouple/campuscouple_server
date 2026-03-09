import { Controller, Post, Get, Body, Headers, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { BaseResponse } from '../../common/dto/base-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('profile')
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
