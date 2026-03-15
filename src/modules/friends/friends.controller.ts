import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FriendsService } from './friends.service';
import { BaseResponse } from 'src/common/dto/base-response.dto';
import { GetFriendsListDto } from './dto/get-friends-list.dto';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  getSchemaPath,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PostRequestFriendDto } from './dto/post-request-friend.dto';
import { GetFriendRequestsDto, RespondFriendRequestDto } from './dto/get-friend-requests.dto';

@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Get()
  @ApiExtraModels(GetFriendsListDto)
  @ApiOperation({
    summary: '내 친구 목록',
    description: '사용자의 친구 목록을 조회합니다.',
  })
  @ApiOkResponse({
    description: '내 친구 목록 조회',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '내 친구 목록 조회 성공' },
        data: {
          type: 'array',
          items: {
            $ref: getSchemaPath(GetFriendsListDto),
          },
        },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async getFriends(@Req() req): Promise<BaseResponse<GetFriendsListDto>> {
    try {
      const profileId = req.user.profile.id;
      const result = await this.friendsService.getFriends(profileId);
      return new BaseResponse(true, '내 친구 목록 조회 성공', result);
    } catch (error) {
      return new BaseResponse(false, error.message) as any;
    }
  }

  @Post('request')
  @ApiOperation({
    summary: '친구 신청',
    description: '사용자가 친구 신청을 합니다.',
  })
  @ApiOkResponse({
    description: '친구 신청',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '친구 신청을 보냈어요.' },
        data: {
          type: 'null',
        },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async requestFriend(
    @Body() postrequestFriendDto: PostRequestFriendDto,
    @Req() req: any,
  ): Promise<BaseResponse<any>> {
    try {
      const senderId = req.user.profile.id;
      const receiverId = postrequestFriendDto.receiverId;
      await this.friendsService.sendFriendRequest(senderId, receiverId);

      return new BaseResponse(true, '친구 신청을 보냈어요.', null);
    } catch (error) {
      return new BaseResponse(false, error.message) as any;
    }
  }

  @Get('requests')
  @ApiExtraModels(GetFriendRequestsDto)
  @ApiOperation({
    summary: '친구 신청 목록 조회',
    description: '사용자가 친구 신청 목록을 조회합니다.',
  })
  @ApiOkResponse({
    description: '친구 신청 목록 조회',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '친구 신청 목록 조회를 성공했어요.' },
        data: {
          type: 'array',
          items: {
            $ref: getSchemaPath(GetFriendRequestsDto),
          },
        },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async getRequest(@Req() req: any): Promise<BaseResponse<GetFriendRequestsDto>> {
    try {
      const profileId = req.user.profile.id;
      const result = await this.friendsService.getFriendRequests(profileId);

      return new BaseResponse(true, '친구 신청 목록 조회를 성공했어요.', result);
    } catch (error) {
      return new BaseResponse(false, error.message) as any;
    }
  }

  @Patch('requests/:requestId')
  @ApiOperation({
    summary: '친구 신청 수락/거절.',
    description: '사용자가 친구 신청을 처리합니다.',
  })
  @ApiOkResponse({
    description: '친구 신청 상태 처리',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '친구 신청을 수락했어요..' },
        data: {
          type: 'array',
          items: {
            $ref: getSchemaPath(GetFriendsListDto),
          },
        },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async respondRequest(
    @Req() req: any,
    @Param('requestId', ParseIntPipe) requestId: number,
    @Body() body: RespondFriendRequestDto,
  ): Promise<BaseResponse<any>> {
    try {
      const profileId = req.user.profile.id;
      const { action } = body;

      if (!['ACCEPT', 'REJECT'].includes(action)) {
        throw new BadRequestException('올바른 액션을 선택해주세요.');
      }

      await this.friendsService.handleFriendRequest(profileId, requestId, action);

      return new BaseResponse(
        true,
        action === 'ACCEPT' ? '친구 신청을 수락했어요.' : '친구 신청을 거절했어요.',
        null,
      );
    } catch (error) {
      return new BaseResponse(false, error.message);
    }
  }
}
