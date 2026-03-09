export interface ITossService {
  getAccessToken(authCode: string): Promise<string>;
  getUserKey(accessToken: string): Promise<number>;
}
