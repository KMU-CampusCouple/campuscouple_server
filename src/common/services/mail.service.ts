import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { MailService } from '../interfaces/mail.service.interface';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ConsoleMailService implements MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}
  async sendVerificationCode(email: string, code: string): Promise<void> {
    console.log(`Verification code for ${email}: ${code}`);

    const htmlTemplate = `
    <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>캠퍼스 커플 대학교 인증</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F9F9F9; font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin-top: 50px; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <div style="background-color: #E6A4B4; width: 64px; height: 64px; border-radius: 16px; display: inline-block; margin-bottom: 24px;">
                    <img src="https://cdn-icons-png.flaticon.com/512/3135/3135768.png" alt="Logo" width="40" style="padding-top: 12px; filter: invert(100%);">
                </div>
                
                <h1 style="color: #333333; font-size: 24px; font-weight: 700; margin: 0 0 10px 0;">대학교 인증</h1>
                <p style="color: #666666; font-size: 15px; line-height: 1.6; margin: 0 0 30px 0;">
                    캠퍼스 커플에 오신 것을 환영합니다!<br>
                    본인 확인을 위해 아래의 인증 코드를 입력해 주세요.
                </p>

                <div style="background-color: #FEEFF2; border: 1px dashed #E6A4B4; border-radius: 12px; padding: 24px; margin-bottom: 30px;">
                    <span style="color: #E6A4B4; font-size: 32px; font-weight: 800; letter-spacing: 8px;">{{AUTH_CODE}}</span>
                </div>

                <p style="color: #999999; font-size: 13px; line-height: 1.5; margin: 0;">
                    이 코드는 5분 동안 유효합니다.<br>
                    요청하신 적이 없다면 이 메일을 무시해 주세요.
                </p>
            </td>
        </tr>
        <tr>
            <td align="center" style="padding: 20px; background-color: #F4F4F4;">
                <p style="color: #BBBBBB; font-size: 12px; margin: 0;">
                    © 2026 Campus Couple. All rights reserved.<br>
                    ac.kr 도메인의 이메일만 인증 가능합니다.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
    `;

    const finalizedHtml = htmlTemplate.replace('{{AUTH_CODE}}', code);

    try {
      await this.mailerService.sendMail({
        from: `"캠퍼스 커플" <${this.configService.get('EMAIL_AUTH_USER')}`,
        to: email,
        subject: '[캠퍼스 커플] 학교 이메일 인증 번호입니다.',
        html: finalizedHtml,
      });

      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending email: ', error);
      throw new InternalServerErrorException('메일 전송 중 오류가 발생했습니다.');
    }
  }
}
