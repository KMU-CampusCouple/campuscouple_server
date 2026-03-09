import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ITossService } from '../../../common/interfaces/toss.service.interface';

@Injectable()
export class RealTossService implements ITossService {
  constructor(private readonly httpService: HttpService) {}

  async getAccessToken(authCode: string): Promise<string> {
    const response = await firstValueFrom(
      this.httpService.post('https://apps-in-toss-api.toss.im/generate-token', {
        authorizationCode: authCode,
      }),
    );
    return response.data.accessToken;
  }

  async getUserKey(accessToken: string): Promise<number> {
    const response = await firstValueFrom(
      this.httpService.get('https://apps-in-toss-api.toss.im/login-me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    );
    return response.data.userKey;
  }
}
