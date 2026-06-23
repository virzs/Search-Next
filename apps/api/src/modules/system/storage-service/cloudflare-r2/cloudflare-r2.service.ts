import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from 'src/modules/redis/redis.service';
import { Readable } from 'stream';
import { readableToBuffer } from '../utils/buffer';

@Injectable()
export class CloudflareR2Service {
  private s3Client: S3Client | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  private async getConfig() {
    return await this.configService.get('r2');
  }

  private async initializeS3Client() {
    const config = await this.getConfig();

    this.s3Client = new S3Client({
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      region: 'auto',
      credentials: {
        accessKeyId: config.accessKey,
        secretAccessKey: config.secretKey,
      },
    });
  }

  private async getS3Client() {
    if (!this.s3Client) {
      await this.initializeS3Client();
    }
    return this.s3Client;
  }

  async uploadFile(key: string, file: Express.Multer.File) {
    const s3Client = await this.getS3Client();
    const config = await this.getConfig();

    const command = new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    return s3Client.send(command);
  }

  async uploadBuffer(
    key: string,
    buffer: Buffer,
    mimetype: string = 'application/octet-stream',
  ) {
    const s3Client = await this.getS3Client();
    const config = await this.getConfig();

    const command = new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    });

    return s3Client.send(command);
  }

  async getPutObjectSignedUrl(key: string, mimetype: string, expiresIn = 3600) {
    const s3Client = await this.getS3Client();
    const config = await this.getConfig();

    const command = new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      ContentType: mimetype,
    });

    return getSignedUrl(s3Client, command, { expiresIn });
  }

  async getObjectBuffer(key: string) {
    const s3Client = await this.getS3Client();
    const config = await this.getConfig();
    const command = new GetObjectCommand({
      Bucket: config.bucket,
      Key: key,
    });
    const res = await s3Client.send(command);
    const body = res.Body;
    if (!body) return Buffer.alloc(0);
    return await readableToBuffer(body as Readable);
  }

  async getObjectMeta(key: string) {
    const s3Client = await this.getS3Client();
    const config = await this.getConfig();
    const command = new HeadObjectCommand({
      Bucket: config.bucket,
      Key: key,
    });
    const res = await s3Client.send(command);

    return {
      size: res.ContentLength,
      mimetype: res.ContentType,
    };
  }

  async getFileUrl(key: string) {
    const cachedUrl = await this.redisService.get(key);
    if (cachedUrl) {
      return cachedUrl;
    }

    const s3Client = await this.getS3Client();
    const config = await this.getConfig();

    const command = new GetObjectCommand({
      Bucket: config.bucket,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    // 使用自定义域名替换默认的 Cloudflare R2 域名
    const customDomain = config.customDomain;
    let finalUrl = url;
    if (customDomain) {
      finalUrl = url.replace(
        `${config.bucket}.${config.accountId}.r2.cloudflarestorage.com`,
        customDomain,
      );
    }

    // 缓存 URL
    await this.redisService.set(key, finalUrl, 3200 * 1000);

    return finalUrl;
  }

  async deleteFile(key: string) {
    const s3Client = await this.getS3Client();
    const config = await this.getConfig();

    const command = new DeleteObjectCommand({
      Bucket: config.bucket,
      Key: key,
    });

    return s3Client.send(command);
  }
}
