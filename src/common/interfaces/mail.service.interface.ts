export interface MailService {
  sendVerificationCode(email: string, code: string): Promise<void>;
}
