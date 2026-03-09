// bigint.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { map } from 'rxjs/operators';

@Injectable()
export class BigIntInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(map((data) => this.serializeBigInt(data)));
  }

  private serializeBigInt(data: any): any {
    if (typeof data === 'bigint') return data.toString();
    if (Array.isArray(data)) return data.map((item) => this.serializeBigInt(item));
    if (typeof data === 'object' && data !== null) {
      return Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, this.serializeBigInt(value)]),
      );
    }
    return data;
  }
}
