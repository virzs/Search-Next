import { Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes } from 'crypto';
import { jwtConfig } from 'src/config/jwt';

@Injectable()
export class AiSecretService {
  private readonly algorithm = 'aes-256-gcm';

  private getSecretKey(): Buffer {
    const rawSecret = process.env.ai_secret_key || jwtConfig.accessToken.secret || 'search-next-ai-secret';
    return createHash('sha256').update(rawSecret).digest();
  }

  encrypt(value?: string): string {
    if (!value) {
      return '';
    }

    const iv = randomBytes(12);
    const cipher = createCipheriv(this.algorithm, this.getSecretKey(), iv);
    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    return ['v1', iv.toString('base64url'), tag.toString('base64url'), encrypted.toString('base64url')].join(':');
  }

  decrypt(value?: string): string {
    if (!value) {
      return '';
    }

    const [version, iv, tag, encrypted] = value.split(':');
    if (version !== 'v1' || !iv || !tag || !encrypted) {
      return value;
    }

    const decipher = createDecipheriv(this.algorithm, this.getSecretKey(), Buffer.from(iv, 'base64url'));
    decipher.setAuthTag(Buffer.from(tag, 'base64url'));
    return Buffer.concat([
      decipher.update(Buffer.from(encrypted, 'base64url')),
      decipher.final(),
    ]).toString('utf8');
  }

  hash(value: string): string {
    const rawSecret = process.env.ai_secret_key || jwtConfig.accessToken.secret || 'search-next-ai-secret';
    return createHmac('sha256', rawSecret).update(value).digest('hex');
  }

  generateConsumerKey(): string {
    return `sk-sn-${randomBytes(32).toString('base64url')}`;
  }

  preview(value: string): string {
    if (!value) {
      return '';
    }
    if (value.length <= 12) {
      return `${value.slice(0, 4)}...${value.slice(-4)}`;
    }
    return `${value.slice(0, 8)}...${value.slice(-4)}`;
  }
}
