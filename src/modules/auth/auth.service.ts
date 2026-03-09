import { Injectable, BadRequestException, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../../prisma/prisma.service';
import { SendVerificationDto } from './dto/send-verification.dto';
import { ConfirmVerificationDto } from './dto/confirm-verification.dto';
import { TossLoginDto } from './dto/toss-login.dto';
import type { MailService } from '../../common/interfaces/mail.service.interface';
import type { ITossService } from '../../common/interfaces/toss.service.interface';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject('MailService') private mailService: MailService,
    @Inject('TossService') private readonly tossService: ITossService,
  ) {}

  async sendVerificationCode(dto: SendVerificationDto): Promise<{ message: string }> {
    // 학교 이메일 검증 (@ac.kr 등)
    const universityDomains = ['ac.kr', 'edu', 'university.edu']; // 예시
    const isValidDomain = universityDomains.some((domain) => dto.email.endsWith(domain));
    if (!isValidDomain) {
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
    await this.setVerificationCode(dto.email.trim(), code);

    // 이메일 발송
    await this.mailService.sendVerificationCode(dto.email.trim(), code);

    return { message: '인증 코드가 발송되었습니다.' };
  }

  async confirmVerificationCode(
    dto: ConfirmVerificationDto,
    token: string,
  ): Promise<{ tempToken: string }> {
    let payload: any;
    const storedCode = await this.getVerificationCode(dto.email.trim());
    try {
      payload = this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }

    if (!payload.tossUserKey) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }

    if (!storedCode || storedCode !== dto.code) {
      throw new BadRequestException('잘못된 인증 코드입니다.');
    }

    // 임시 토큰 발급 (프로필 등록까지 유효)
    const tempToken = this.jwtService.sign(
      { email: dto.email, verified: true, tossUserKey: payload.tossUserKey },
      { expiresIn: '1h' },
    );

    // 코드 사용 후 삭제
    await this.deleteVerificationCode(dto.email);

    // Step-up Auth: 임시 인증 데이터 저장 (15분)
    await this.setTempAuthData(payload.tossUserKey.toString(), dto.email);

    return { tempToken };
  }

  async tossLogin(dto: TossLoginDto): Promise<{ access_token: string }> {
    try {
      // 1. authorizationCode로 accessToken 발급
      const accessToken = await this.tossService.getAccessToken(dto.authorizationCode);

      // 2. accessToken으로 userKey 조회
      const userKey = await this.tossService.getUserKey(accessToken);

      // 3. DB에서 tossUserKey로 사용자 조회 또는 생성
      let user = await this.prisma.user.findUnique({
        where: { tossUserKey: BigInt(userKey) },
      });

      if (!user) {
        // 새 사용자 생성 (프로필은 나중에 등록)
        user = await this.prisma.user.create({
          data: {
            tossUserKey: BigInt(userKey),
            isVerified: true, // 토스 로그인은 자동 인증
            email: `toss_${userKey}@temp.com`, // 임시 이메일 (실제로는 토스에서 이메일 제공받을 수 있음)
          },
        });
      }

      // 4. JWT 토큰 발급
      const payload = { tossUserKey: user.tossUserKey.toString(), sub: user.id };
      return {
        access_token: this.jwtService.sign(payload),
      };
    } catch (error) {
      throw new BadRequestException('토스 로그인에 실패했습니다.');
    }
  }

  // Redis 기반 인증 코드 관리
  async setVerificationCode(email: string, code: string): Promise<void> {
    await this.cacheManager.set(`verification:${email}`, code, 300000); // 5분 TTL (초 단위)
  }

  async getVerificationCode(email: string): Promise<string | undefined> {
    return await this.cacheManager.get<string>(`verification:${email}`);
  }

  async deleteVerificationCode(email: string): Promise<void> {
    await this.cacheManager.del(`verification:${email}`);
  }

  // Step-up Auth: 임시 인증 데이터 저장 (프로필 설정 단계에서 참조)
  async setTempAuthData(tossUserKey: string, email: string): Promise<void> {
    await this.cacheManager.set(`tempAuth:${tossUserKey}`, { email, tossUserKey }, 900); // 15분 TTL (초 단위)
  }

  async getTempAuthData(
    tossUserKey: string,
  ): Promise<{ email: string; tossUserKey: string } | undefined> {
    return await this.cacheManager.get<{ email: string; tossUserKey: string }>(
      `tempAuth:${tossUserKey}`,
    );
  }
}
