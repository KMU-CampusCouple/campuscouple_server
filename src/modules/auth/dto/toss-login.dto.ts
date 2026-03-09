import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TossLoginDto {
  @ApiProperty({
    description: '토스에서 받은 authorization code',
    example: 'abc123def456',
  })
  @IsString()
  @IsNotEmpty()
  authorizationCode: string;
}
