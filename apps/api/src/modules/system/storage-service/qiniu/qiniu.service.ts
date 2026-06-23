import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as qiniu from 'qiniu';
import axios from 'axios';
import { bufferToReadable } from '../utils/buffer';
import { parseUploadFilename } from '../utils/filename';
import { randomUUID } from 'crypto';

@Injectable()
export class QiniuService {
  constructor(private readonly configService: ConfigService) {}

  async getConfig() {
    return await this.configService.get('qiniu');
  }

  async getQiniu() {
    const config = await this.getConfig();

    qiniu.conf.ACCESS_KEY = config.accessKey;
    qiniu.conf.SECRET_KEY = config.secretKey;

    return qiniu;
  }

  async getMac() {
    const config = await this.getConfig();

    const mac = new qiniu.auth.digest.Mac(config.accessKey, config.secretKey);
    return mac;
  }

  async getBucketManager() {
    const mac = await this.getMac();

    const bucketManager = new qiniu.rs.BucketManager(mac, null);
    return bucketManager;
  }

  async getPutPolicy(key: string) {
    const config = await this.getConfig();
    const q = await this.getQiniu();

    const options = {
      scope: config.bucket + ':' + key,
      expires: 3600,
    };

    const mac = await this.getMac();
    const putPolicy = new q.rs.PutPolicy(options);
    const token = putPolicy.uploadToken(mac);

    return token;
  }

  async uploadFile(dir: string, file: Express.Multer.File) {
    const qiniu = await this.getQiniu();
    const config = new qiniu.conf.Config();
    const parsed = parseUploadFilename(file.originalname);
    // 生成随机字符串+文件名
    const hashName = `${randomUUID()}_${parsed.safeName}`;

    const key = dir + '/' + hashName;
    const token = await this.getPutPolicy(key);
    const extra = new qiniu.form_up.PutExtra();
    const formUploader = new qiniu.form_up.FormUploader(config);
    // file buffer to stream
    const stream = bufferToReadable(file.buffer);

    const putFile: any = await new Promise((resolve, reject) => {
      formUploader.putStream(token, key, stream, extra, (err, ret) => {
        stream.push(null);
        if (!err) {
          resolve(ret);
        } else {
          reject(err);
        }
      });
    });

    stream.destroy();

    const url = await this.getVisitUrl(key);

    if (putFile.key) {
      return {
        name: parsed.normalized,
        key: hashName,
        mimetype: file.mimetype,
        dir: dir,
        size: file.size,
        url,
      };
    } else {
      return putFile;
    }
  }

  async uploadBuffer(
    key: string,
    buffer: Buffer,
    mimetype: string = 'application/octet-stream',
  ) {
    const qiniu = await this.getQiniu();
    const config = new qiniu.conf.Config();
    const token = await this.getPutPolicy(key);
    const extra = new qiniu.form_up.PutExtra();
    extra.mimeType = mimetype;
    const formUploader = new qiniu.form_up.FormUploader(config);
    const stream = bufferToReadable(buffer);

    const putFile: any = await new Promise((resolve, reject) => {
      formUploader.putStream(token, key, stream, extra, (err, ret) => {
        stream.push(null);
        if (!err) resolve(ret);
        else reject(err);
      });
    });

    stream.destroy();

    return putFile;
  }

  async downloadFileBuffer(key: string) {
    const url = await this.getVisitUrl(key);
    const resp = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(resp.data);
  }

  async getFileMeta(key: string) {
    const bucketManager = await this.getBucketManager();
    const config = await this.getConfig();

    return await new Promise<{ size: number; mimetype: string }>(
      (resolve, reject) => {
        bucketManager.stat(config.bucket, key, (err, respBody) => {
          if (err) {
            reject(err);
            return;
          }

          resolve({
            size: respBody.fsize,
            mimetype: respBody.mimeType,
          });
        });
      },
    );
  }

  // 获取访问链接
  async getVisitUrl(key: string) {
    const config = await this.getConfig();

    const bucketManager = await this.getBucketManager();
    const publicBucketDomain = config.bucketDomain;
    const deadline = Number((Date.now() / 1000 + 3600).toFixed(0));
    const publicDownloadUrl = bucketManager.privateDownloadUrl(
      publicBucketDomain,
      key,
      deadline,
    );

    return publicDownloadUrl;
  }

  // 删除文件
  async deleteFile(key: string) {
    const bucketManager = await this.getBucketManager();
    const config = await this.getConfig();

    const res = await new Promise((resolve, reject) => {
      bucketManager.delete(config.bucket, key, (err, respBody, respInfo) => {
        void respBody;
        if (err) {
          reject(err);
        } else {
          resolve(respInfo);
        }
      });
    });

    return res;
  }
}
