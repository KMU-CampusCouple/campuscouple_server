import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: '학교 이메일 주소',
    example: 'student@university.ac.kr',
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: '비밀번호',
    example: 'password123',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
