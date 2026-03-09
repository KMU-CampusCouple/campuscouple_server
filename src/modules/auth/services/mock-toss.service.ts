import { Injectable } from '@nestjs/common';
import { ITossService } from '../../../common/interfaces/toss.service.interface';

@Injectable()
export class MockTossService implements ITossService {
  async getAccessToken(authCode: string): Promise<string> {
    // Mock: authorizationCode에 관계없이 가짜 accessToken 반환
    return 'mock_access_token_' + authCode;
  }

  async getUserKey(accessToken: string): Promise<number> {
    // Mock: 하드코딩된 tossUserKey 반환 (BigInt 호환)
    return 123456789;
  }
}
