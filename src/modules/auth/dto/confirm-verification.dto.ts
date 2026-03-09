import { IsEmail, IsNotEmpty, IsNumber, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmVerificationDto {
  @ApiProperty({
    description: '학교 이메일 주소',
    example: 'student@university.ac.kr',
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: '6자리 인증 코드',
    example: '123456',
    required: true,
    minLength: 6,
    maxLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  code: string;
}
