import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { readFileToBuffer, writeBufferToFile } from '../utils/buffer';
import { parseUploadFilename } from '../utils/filename';

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const access = promisify(fs.access);

@Injectable()
export class LocalService {
  constructor(private readonly configService: ConfigService) {}

  async getConfig() {
    return await this.configService.get('storage-service');
  }

  async uploadFile(dir: string, file: Express.Multer.File) {
    const config = await this.getConfig();
    const basePath = config.localStoragePath;
    const parsed = parseUploadFilename(file.originalname);

    // 获取文件扩展名
    const ext = path.extname(parsed.safeName);

    // 生成随机字符串作为文件名，避免中文乱码
    const randomName = Math.random().toString(36).substr(2, 15);
    const timestamp = Date.now();
    const hashName = `${randomName}_${timestamp}${ext}`;

    // 构建完整路径
    const fullDir = path.join(basePath, dir);
    const filePath = path.join(fullDir, hashName);

    // 确保目录存在
    await fs.promises.mkdir(fullDir, { recursive: true });

    // 写入文件
    await writeFile(filePath, file.buffer);

    const key = `${dir}/${hashName}`;
    const url = await this.getVisitUrl(key);

    return {
      name: parsed.normalized,
      key: hashName,
      mimetype: file.mimetype,
      dir: dir,
      size: file.size,
      url,
    };
  }

  async uploadBuffer(
    key: string,
    buffer: Buffer,
    mimetype: string = 'application/octet-stream',
  ) {
    const config = await this.getConfig();
    const basePath = config.localStoragePath;
    const fullPath = path.join(basePath, key);
    await writeBufferToFile(fullPath, buffer);

    const url = await this.getVisitUrl(key);

    return {
      key,
      url,
      mimetype,
      size: buffer.length,
    };
  }

  async readFileBuffer(key: string) {
    const config = await this.getConfig();
    const basePath = config.localStoragePath;
    const filePath = path.join(basePath, key);
    return await readFileToBuffer(filePath);
  }

  // 获取访问链接
  async getVisitUrl(key: string) {
    // 返回相对路径，由静态文件服务处理
    return `/static/${key}`;
  }

  // 删除文件
  async deleteFile(key: string, forceDelete: boolean = false) {
    const config = await this.getConfig();
    const basePath = config.localStoragePath;
    const filePath = path.join(basePath, key);

    try {
      // 如果强制删除，直接尝试删除文件，不检查文件是否存在
      if (forceDelete) {
        try {
          await unlink(filePath);
          return { success: true, message: '文件删除成功' };
        } catch (unlinkError) {
          // 如果文件不存在，也认为删除成功
          if (unlinkError.code === 'ENOENT') {
            return { success: true, message: '文件已不存在，删除成功' };
          }
          return {
            success: false,
            message: '文件删除失败',
            error: unlinkError,
          };
        }
      }

      // 正常删除流程：先检查文件是否存在
      await access(filePath);
      await unlink(filePath);
      return { success: true, message: '文件删除成功' };
    } catch (error) {
      // 如果是文件不存在错误，提供更详细的信息
      if (error.code === 'ENOENT') {
        return {
          success: false,
          message: '文件不存在，可能已被删除或路径包含特殊字符',
          error,
          suggestion: '可以尝试强制删除模式',
        };
      }
      return { success: false, message: '文件删除失败', error };
    }
  }
}
