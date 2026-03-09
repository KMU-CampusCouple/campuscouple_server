import { Injectable, BadRequestException, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../../prisma/prisma.service';
import { SendVerificationDto } from './dto/send-verification.dto';
import { ConfirmVerificationDto } from './dto/confirm-verification.dto';
import { LoginDto } from './dto/login.dto';
import { TossLoginDto } from './dto/toss-login.dto';
import type { MailService } from '../../common/interfaces/mail.service.interface';
import * as bcrypt from 'bcrypt';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  // 간단한 메모리 저장소 (실제로는 Redis나 DB 사용)
  private verificationCodes = new Map<string, { code: string; expiry: number }>();

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private httpService: HttpService,
    @Inject('MailService') private mailService: MailService,
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
    const expiry = Date.now() + 5 * 60 * 1000; // 5분
    this.verificationCodes.set(dto.email.trim(), { code, expiry });

    // 이메일 발송
    await this.mailService.sendVerificationCode(dto.email.trim(), code);

    return { message: '인증 코드가 발송되었습니다.' };
  }

  async confirmVerificationCode(
    dto: ConfirmVerificationDto,
    token: string,
  ): Promise<{ tempToken: string }> {
    let payload: any;
    const stored = this.verificationCodes.get(dto.email.trim());

    try {
      payload = this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }

    if (!payload.tossUserKey) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }

    if (!stored || stored.code !== dto.code || Date.now() > stored.expiry) {
      throw new BadRequestException('잘못된 인증 코드입니다.');
    }

    // 임시 토큰 발급 (프로필 등록까지 유효)
    const tempToken = this.jwtService.sign(
      { email: dto.email, verified: true, tossUserKey: payload.tossUserKey },
      { expiresIn: '1h' },
    );

    // 코드 사용 후 삭제
    this.verificationCodes.delete(dto.email);

    return { tempToken };
  }

  async tossLogin(dto: TossLoginDto): Promise<{ access_token: string }> {
    try {
      // 1. authorizationCode로 accessToken 발급
      const tokenResponse = await firstValueFrom(
        this.httpService.post('https://apps-in-toss-api.toss.im/generate-token', {
          authorizationCode: dto.authorizationCode,
        }),
      );

      const { accessToken } = tokenResponse.data;

      // 2. accessToken으로 userKey 조회
      const userResponse = await firstValueFrom(
        this.httpService.get('https://apps-in-toss-api.toss.im/login-me', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }),
      );

      const { userKey } = userResponse.data;

      // 3. DB에서 tossUserKey로 사용자 조회 또는 생성
      let user = await this.prisma.user.findUnique({
        where: { tossUserKey: BigInt(userKey) },
      });

      if (!user) {
        // 새 사용자 생성 (프로필은 나중에 등록)
        user = await this.prisma.user.create({
          data: {
            tossUserKey: BigInt(userKey),
            isVerified: false, // 토스 로그인은 자동 인증
            email: `toss_${userKey}@temp.com`, // 임시 이메일 (실제로는 토스에서 이메일 제공받을 수 있음)
          },
        });
      }

      // 4. JWT 토큰 발급
      const payload = { tossUserKey: user.tossUserKey, sub: user.id };
      return {
        access_token: this.jwtService.sign(payload),
      };
    } catch (error) {
      throw new BadRequestException('토스 로그인에 실패했습니다.');
    }
  }
}
