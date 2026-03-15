import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { FriendProfileDto, GetFriendsListDto } from './dto/get-friends-list.dto';
import { FriendRequestDto, GetFriendRequestsDto } from './dto/get-friend-requests.dto';

@Injectable()
export class FriendsService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async getFriends(profileId: number) {
    const friendships = await this.prisma.friend.findMany({
      where: {
        OR: [{ user1Id: profileId }, { user2Id: profileId }],
      },
      include: {
        user1: true,
        user2: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const friends = friendships.map((friendship) => {
      const friendProfile = friendship.user1Id === profileId ? friendship.user2 : friendship.user1;

      return new FriendProfileDto({
        profileId: friendProfile.id,
        name: friendProfile.name,
        univ: friendProfile.univ,
        profileImage: friendProfile.profileImage,
      });
    });

    if (friends.length === 0) throw new NotFoundException('친구가 없어요.');

    return new GetFriendsListDto({
      profiles: friends,
    });
  }

  async sendFriendRequest(senderId: number, receiverId: number) {
    if (senderId === receiverId)
      throw new BadRequestException('자기 자신한테는 친구 신청을 할 수 없어요.');

    const existingFriend = await this.prisma.friend.findFirst({
      where: {
        OR: [
          { user1Id: senderId, user2Id: receiverId },
          { user1Id: receiverId, user2Id: senderId },
        ],
      },
    });
    if (existingFriend) throw new BadRequestException('이미 친구 관계예요.');

    const existingRequest = await this.prisma.friendRequest.findUnique({
      where: {
        senderId_receiverId: {
          senderId,
          receiverId,
        },
      },
    });

    if (existingRequest) {
      if (existingRequest.status === 'PENDING')
        throw new BadRequestException('이미 친구 신청을 보냈어요.');

      if (existingRequest.status === 'REJECTED') {
        return this.prisma.friendRequest.update({
          where: { id: existingRequest.id },
          data: { status: 'PENDING' },
        });
      }
    }

    return this.prisma.friendRequest.create({
      data: {
        senderId,
        receiverId,
        status: 'PENDING',
      },
    });
  }

  async getFriendRequests(profileId: number) {
    const requests = await this.prisma.friendRequest.findMany({
      where: {
        receiverId: profileId,
      },
      include: {
        sender: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const friend_requests = requests.map((request) => {
      const profile = request.sender;

      return new FriendRequestDto({
        requestId: request.id,
        profileId: profile.id,
        name: profile.name,
        univ: profile.univ,
        profileImage: profile.profileImage,
      });
    });

    if (friend_requests.length === 0) throw new NotFoundException('친구 신청이 오지 않았어요.');

    return new GetFriendRequestsDto({
      profiles: friend_requests,
    });
  }

  async handleFriendRequest(profileId: number, requestId: number, action: string) {
    const request = await this.prisma.friendRequest.findUnique({
      where: { id: requestId },
    });

    if (!request || request.receiverId !== profileId)
      throw new NotFoundException('존재하지 않거나 권한이 없는 친구 신청이에요.');

    if (request.status !== 'PENDING') throw new BadRequestException('이미 처리된 신청이에요.');

    if (action === 'REJECT') {
      return this.prisma.friendRequest.update({
        where: { id: requestId },
        data: { status: 'REJECTED' },
      });
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.friendRequest.update({
        where: { id: requestId },
        data: { status: 'ACCEPTED' },
      });

      const [u1, u2] = [request.senderId, request.receiverId].sort((a, b) => a - b);

      return tx.friend.upsert({
        where: {
          user1Id_user2Id: { user1Id: u1, user2Id: u2 },
        },
        update: {},
        create: {
          user1Id: u1,
          user2Id: u2,
        },
      });
    });
  }
}
