import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendVerificationDto {
  @ApiProperty({
    description: '학교 이메일 주소 (@ac.kr, @edu 등)',
    example: 'student@university.ac.kr',
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
