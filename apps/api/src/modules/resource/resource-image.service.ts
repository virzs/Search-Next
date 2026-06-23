import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import sharp from 'sharp';
import { CloudflareR2Service } from '../system/storage-service/cloudflare-r2/cloudflare-r2.service';
import { LocalService } from '../system/storage-service/local/local.service';
import { QiniuService } from '../system/storage-service/qiniu/qiniu.service';
import { parseUploadFilename } from '../system/storage-service/utils/filename';
import { Resource } from './schemas/resource';
import { ResourceName } from './schemas/ref-names';

/**
 * 支持的输出格式（会影响文件后缀与 Content-Type）。
 */
export type ResourceImageOutputFormat = 'webp' | 'jpeg' | 'png' | 'avif';

/**
 * 单个输出变体的处理配置。
 *
 * - outputName: 可自定义输出文件名（不包含目录），例如 "thumbnail.webp"。
 * - resize: 传递给 sharp.resize 的参数（例如 width/height/fit/withoutEnlargement 等）。
 * - format/quality: 可对单个变体覆盖全局格式与质量。
 * - transform: 允许在 resize/encode 前对 pipeline 做更细粒度的调整（例如 extract/blur/rotate 等）。
 */
export type ResourceImageProcessVariant = {
  outputName?: string;
  resize?: sharp.ResizeOptions;
  format?: ResourceImageOutputFormat;
  quality?: number;
  transform?: (pipeline: sharp.Sharp) => sharp.Sharp;
};

/**
 * 图片处理入口参数。
 *
 * - dir: 输出资源写入的目录（默认沿用原资源的 dir）。
 * - autoRotate: 默认 true；为 true 时会调用 sharp.rotate() 以自动按 EXIF 方向纠正。
 * - format/quality: 默认输出格式与质量（变体可覆盖）。
 * - transform: 全局 transform，会在每个变体的 transform 之前执行。
 * - variant: 单张输出的配置（优先级低于 variants/widths）。
 * - variants: 多张输出的配置（优先级最高）。
 * - widths: 快捷方式：按 width 生成多张图（优先级次于 variants）。
 */
export type ResourceImageProcessOptions = {
  dir?: string;
  autoRotate?: boolean;
  quality?: number;
  format?: ResourceImageOutputFormat;
  transform?: (pipeline: sharp.Sharp) => sharp.Sharp;
  variant?: ResourceImageProcessVariant;
  variants?: ResourceImageProcessVariant[];
  widths?: number[];
};

/**
 * Resource 内部的图片处理服务：
 * - 读取原图（按资源当前存储服务）
 * - 使用 sharp 生成一张或多张输出
 * - 将输出作为新的 Resource 资源上传并落库
 *
 * 设计目标：
 * - 通用：不绑定队列/任务
 * - 可扩展：允许调用方传入 sharp 参数/transform
 * - 可组合：variants/widths 支持多尺寸多张输出
 */
@Injectable()
export class ResourceImageService {
  constructor(
    private readonly qiniuService: QiniuService,
    private readonly localService: LocalService,
    private readonly r2Service: CloudflareR2Service,
    private readonly configService: ConfigService,
    @InjectModel(ResourceName) private readonly resourceModel: Model<Resource>,
  ) {}

  /**
   * 处理并生成单张图片资源，返回创建的 Resource 文档。
   *
   * 说明：
   * - 若 options 指定了 variants/widths，仍只返回第一张（建议多张场景改用 processImages）。
   */
  async processImageOne(
    resourceId: string,
    options: ResourceImageProcessOptions,
    user?: string,
  ): Promise<Resource> {
    const created = await this.processImages(resourceId, options, user);
    return created[0];
  }

  /**
   * 处理并生成多张图片资源，返回创建的 Resource 文档数组。
   *
   * 输出数量的决定规则：
   * - options.variants 存在且非空：按 variants 数量输出
   * - 否则 options.widths 存在且非空：按 widths 去重后数量输出
   * - 否则：按 options.variant（或空配置）输出 1 张
   */
  async processImages(
    resourceId: string,
    options: ResourceImageProcessOptions,
    user?: string,
  ): Promise<Resource[]> {
    const resource = await this.resourceModel.findById(resourceId);
    if (!resource) throw new Error('资源不存在');
    if (!resource.mimetype?.startsWith?.('image/')) {
      throw new Error('资源不是图片');
    }

    const originalBuffer = await this.downloadOriginalByService(
      resource.service,
      resource.key,
    );
    if (!originalBuffer?.length) throw new Error('无法读取原图');

    const dir = options?.dir ?? resource.dir;
    const parsed = parseUploadFilename(resource.key.split('/').pop() || '');
    const baseName = parsed.baseName || 'image';

    const variants = this.normalizeVariants(options);

    return await Promise.all(
      variants.map(async (variant) => {
        const pipelineBase = sharp(originalBuffer, { failOnError: false });
        const pipelineRotated =
          options?.autoRotate === false ? pipelineBase : pipelineBase.rotate();

        const pipeline1 = options?.transform
          ? options.transform(pipelineRotated)
          : pipelineRotated;
        const pipeline2 = variant.transform
          ? variant.transform(pipeline1)
          : pipeline1;
        const pipeline3 = variant.resize
          ? pipeline2.resize(variant.resize)
          : pipeline2;

        const format = variant.format ?? options?.format ?? 'webp';
        const quality = variant.quality ?? options?.quality ?? 80;
        const { ext, mimetype } = this.getFormatMeta(format);

        const { data, info } = await this.encodeByFormat(
          pipeline3,
          format,
          quality,
        ).toBuffer({ resolveWithObject: true });

        const outputName =
          variant.outputName ??
          this.buildOutputName({
            baseName,
            ext,
            resizeWidth: info.width,
            resizeHeight: info.height,
          });

        return await this.uploadDerivedImage({
          dir,
          outputName,
          buffer: data,
          mimetype,
          user,
        });
      }),
    );
  }

  private normalizeVariants(
    options: ResourceImageProcessOptions,
  ): ResourceImageProcessVariant[] {
    if (Array.isArray(options?.variants) && options.variants.length > 0) {
      return options.variants;
    }

    if (Array.isArray(options?.widths) && options.widths.length > 0) {
      const widths = options.widths
        .filter((w) => Number.isFinite(w) && w > 0)
        .map((w) => Math.floor(w));
      const uniq = [...new Set(widths)];
      return uniq.map((w) => ({
        resize: { width: w, withoutEnlargement: true },
      }));
    }

    return [options?.variant ?? {}];
  }

  private buildOutputName({
    baseName,
    ext,
    resizeWidth,
    resizeHeight,
  }: {
    baseName: string;
    ext: string;
    resizeWidth?: number;
    resizeHeight?: number;
  }) {
    const w = typeof resizeWidth === 'number' ? resizeWidth : undefined;
    const h = typeof resizeHeight === 'number' ? resizeHeight : undefined;
    if (w && h) return `${baseName}@${w}x${h}.${ext}`;
    if (w) return `${baseName}@w${w}.${ext}`;
    return `${baseName}.${ext}`;
  }

  private async downloadOriginalByService(
    service: Resource['service'],
    key: string,
  ) {
    if (service === 'local') return await this.localService.readFileBuffer(key);
    if (service === 'r2') return await this.r2Service.getObjectBuffer(key);
    if (service === 'qiniu')
      return await this.qiniuService.downloadFileBuffer(key);
    throw new Error('不支持的存储服务');
  }

  private getFormatMeta(format: ResourceImageOutputFormat): {
    ext: string;
    mimetype: string;
  } {
    if (format === 'jpeg') return { ext: 'jpg', mimetype: 'image/jpeg' };
    return { ext: format, mimetype: `image/${format}` };
  }

  private encodeByFormat(
    pipeline: sharp.Sharp,
    format: ResourceImageOutputFormat,
    quality: number,
  ) {
    if (format === 'webp') return pipeline.webp({ quality });
    if (format === 'jpeg') return pipeline.jpeg({ quality, mozjpeg: true });
    if (format === 'png') return pipeline.png({ quality, compressionLevel: 9 });
    return pipeline.avif({ quality });
  }

  /**
   * 将 sharp 输出 buffer 上传为新的 Resource。
   *
   * 说明：
   * - 使用当前配置的默认存储服务（storage-service.service）
   * - 输出资源会写入指定 dir
   * - 输出文件名使用 outputName（会参与生成 key）
   */
  private async uploadDerivedImage({
    dir,
    outputName,
    buffer,
    mimetype,
    user,
  }: {
    dir: string;
    outputName: string;
    buffer: Buffer;
    mimetype: string;
    user?: string;
  }): Promise<Resource> {
    const config = this.configService.get('storage-service');

    const file: Express.Multer.File = {
      fieldname: 'file',
      originalname: outputName,
      encoding: '7bit',
      mimetype,
      size: buffer.length,
      buffer,
      destination: '',
      filename: '',
      path: '',
      stream: null as any,
    };

    let result: Partial<Resource> | null = null;

    if (config.service === 'qiniu') {
      result = await this.qiniuService.uploadFile(dir, file);
      result.key = `${dir}/${result.key}`;
      result.service = 'qiniu';
    }

    if (config.service === 'local') {
      result = await this.localService.uploadFile(dir, file);
      result.key = `${dir}/${result.key}`;
      result.service = 'local';
    }

    if (config.service === 'r2') {
      const parsed = parseUploadFilename(file.originalname);
      const baseName = parsed.baseName;
      const ext = parsed.ext;
      const fileName = baseName + '-' + Math.random().toString(36).slice(2);
      const key = ext ? `${dir}/${fileName}.${ext}` : `${dir}/${fileName}`;

      const r2Result = await this.r2Service.uploadFile(key, file);
      if (r2Result.$metadata.httpStatusCode === 200) {
        result = {
          name: ext ? `${fileName}.${ext}` : fileName,
          dir,
          key,
          size: file.size,
          mimetype: file.mimetype,
          service: 'r2',
        };
      } else {
        throw new Error('上传失败');
      }
      result.url = await this.r2Service.getFileUrl(key);
    }

    return await this.resourceModel.create({
      ...result,
      creator: user,
    });
  }
}
