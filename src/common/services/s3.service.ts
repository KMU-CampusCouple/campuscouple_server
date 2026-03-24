// s3.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
  private s3 = new S3Client({
    region: 'ap-northeast-2',
    // IAM 역할을 EC2에 이미 부여했다면 credentials는 생략 가능합니다!
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
  });

  async uploadFile(file: Express.Multer.File): Promise<string> {
    try {
      const fileName = `profiles/${Date.now()}-${file.originalname}`;

      const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3.send(command);

      return `https://${process.env.AWS_S3_BUCKET}.s3.ap-northeast-2.amazonaws.com/${fileName}`;
    } catch (error) {
      console.error('에러 이름:', error.name); // 예: AccessDenied, NoSuchBucket 등
      console.error('에러 메시지:', error.message); // 상세 원인
      console.error('전체 스택:', error.stack);

      // 에러를 다시 던져서 NestJS가 적절한 HTTP 응답을 보내게 합니다.
      throw new InternalServerErrorException('이미지 업로드에 실패했어요. 다시 시도해 주세요.');
    }
  }
}
