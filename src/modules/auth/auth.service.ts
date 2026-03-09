import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { SendVerificationDto } from './dto/send-verification.dto';
import { ConfirmVerificationDto } from './dto/confirm-verification.dto';
import { User, Profile } from '@prisma/client';

@Injectable()
export class AuthService {
  // 간단한 메모리 저장소 (실제로는 Redis나 DB 사용)
  private verificationCodes = new Map<string, string>();

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async sendVerificationCode(dto: SendVerificationDto): Promise<{ message: string }> {
    // 학교 이메일 검증 (간단히 @로 끝나는지 확인)
    if (!dto.email.endsWith('@university.edu')) {
      throw new BadRequestException('학교 이메일만 사용 가능합니다.');
    }

    // 이미 존재하는 사용자인지 확인
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('이미 등록된 이메일입니다.');
    }

    // 6자리 랜덤 코드 생성
    const code = Math.random().toString().substr(2, 6);
    this.verificationCodes.set(dto.email, code);

    // 실제로는 이메일 발송 로직 추가
    console.log(`Verification code for ${dto.email}: ${code}`);

    return { message: '인증 코드가 발송되었습니다.' };
  }

  async confirmVerificationCode(dto: ConfirmVerificationDto): Promise<{ tempToken: string }> {
    const storedCode = this.verificationCodes.get(dto.email);

    if (!storedCode || storedCode !== dto.code) {
      throw new BadRequestException('잘못된 인증 코드입니다.');
    }

    // 임시 토큰 발급 (프로필 등록까지 유효)
    const tempToken = this.jwtService.sign(
      { email: dto.email, verified: true },
      { expiresIn: '1h' },
    );

    // 코드 사용 후 삭제
    this.verificationCodes.delete(dto.email);

    return { tempToken };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = (await this.prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    })) as User & { profile: Profile | null };

    if (!user || !user.isVerified) {
      throw new UnauthorizedException('인증되지 않은 사용자입니다.');
    }

    // 비밀번호 검증 (실제로는 bcrypt 사용)
    if (user.password !== password) {
      throw new UnauthorizedException('잘못된 비밀번호입니다.');
    }

    return user;
  }

  login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
