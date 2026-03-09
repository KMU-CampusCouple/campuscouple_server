import { IsEmail, IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateProfileDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(['MALE', 'FEMALE'])
  gender: string;

  @IsString()
  @IsNotEmpty()
  univ: string;

  @IsString()
  @IsNotEmpty()
  major: string;

  @IsString()
  @IsNotEmpty()
  studentId: string;

  @IsOptional()
  @IsString()
  mbti?: string;

  @IsString()
  @IsNotEmpty()
  region: string;

  @IsOptional()
  @IsString()
  intro?: string;

  @IsOptional()
  snsAccounts?: { [key: string]: string };

  @IsOptional()
  @IsString()
  profileImage?: string;
}
