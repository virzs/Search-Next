import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleDestroy,
} from '@nestjs/common';
import { QiniuService } from '../system/storage-service/qiniu/qiniu.service';
import { LocalService } from '../system/storage-service/local/local.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { Resource } from 'src/modules/resource/schemas/resource';
import { ResourceAssociationName, ResourceName } from './schemas/ref-names';
import { CloudflareR2Service } from '../system/storage-service/cloudflare-r2/cloudflare-r2.service';
import { ConfigService } from '@nestjs/config';
import { PageDto } from 'src/public/dto/page';
import { Response } from 'src/utils/response';
import { ResourceAssociation } from './schemas/association';
import { parseUploadFilename } from '../system/storage-service/utils/filename';
import sharp from 'sharp';
import { exiftool } from 'exiftool-vendored';
import { createHmac, randomUUID, timingSafeEqual } from 'crypto';
import {
  ResourceImageProcessOptions,
  ResourceImageService,
} from './resource-image.service';
import { ExifParseMode, parseExifFromBuffer } from './utils/exif';
import {
  CompleteDirectUploadDto,
  CreateDirectUploadDto,
} from './dto/upload.dto';
import { jwtConfig } from 'src/config/jwt';

type DirectUploadIntent = {
  user: string;
  key: string;
  name: string;
  dir: string;
  mimetype: string;
  size: number;
  service: 'qiniu' | 'r2';
  expiresAt: number;
};

@Injectable()
export class ResourceService implements OnModuleDestroy {
  private readonly logger = new Logger(ResourceService.name);

  constructor(
    private readonly qiniuService: QiniuService,
    private readonly localService: LocalService,
    private readonly r2Service: CloudflareR2Service,
    private readonly configService: ConfigService,
    @InjectModel(ResourceName) private readonly resourceModel: Model<Resource>,
    @InjectModel(ResourceAssociationName)
    private readonly associationModel: Model<ResourceAssociation>,
    private readonly resourceImageService: ResourceImageService,
  ) {}

  async onModuleDestroy() {
    await exiftool.end();
  }

  private signUploadIntent(intent: DirectUploadIntent) {
    const payload = Buffer.from(JSON.stringify(intent)).toString('base64url');
    const signature = createHmac('sha256', jwtConfig.accessToken.secret)
      .update(payload)
      .digest('base64url');

    return `${payload}.${signature}`;
  }

  private verifyUploadIntent(uploadToken: string): DirectUploadIntent {
    const [payload, signature] = uploadToken.split('.');

    if (!payload || !signature) {
      throw new BadRequestException('上传凭证无效');
    }

    const expected = createHmac('sha256', jwtConfig.accessToken.secret)
      .update(payload)
      .digest('base64url');
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);

    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      throw new BadRequestException('上传凭证无效');
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    } catch {
      throw new BadRequestException('上传凭证无效');
    }

    if (!this.isDirectUploadIntent(parsed)) {
      throw new BadRequestException('上传凭证无效');
    }

    const intent = parsed;

    if (intent.expiresAt < Date.now()) {
      throw new BadRequestException('上传凭证已过期');
    }

    return intent;
  }

  private isDirectUploadIntent(value: unknown): value is DirectUploadIntent {
    if (!value || typeof value !== 'object') return false;

    const intent = value as Record<string, unknown>;
    return (
      typeof intent.user === 'string' &&
      typeof intent.key === 'string' &&
      typeof intent.name === 'string' &&
      typeof intent.dir === 'string' &&
      typeof intent.mimetype === 'string' &&
      typeof intent.size === 'number' &&
      (intent.service === 'qiniu' || intent.service === 'r2') &&
      typeof intent.expiresAt === 'number'
    );
  }

  private createObjectKey(
    dir: string,
    filename: string,
    service: Resource['service'],
  ) {
    const parsed = parseUploadFilename(filename);

    if (service === 'qiniu') {
      const hashName = `${randomUUID()}_${parsed.safeName}`;
      return {
        key: `${dir}/${hashName}`,
        name: parsed.normalized,
      };
    }

    const fileName = `${parsed.baseName}-${randomUUID()}`;
    const name = parsed.ext ? `${fileName}.${parsed.ext}` : fileName;

    return {
      key: `${dir}/${name}`,
      name,
    };
  }

  async createDirectUpload(data: CreateDirectUploadDto, user: string) {
    if (!user) throw new BadRequestException('用户不存在');

    const config = this.configService.get('storage-service');
    const service = config.service as Resource['service'];
    const expiresIn = 3600;

    const createIntent = (
      object: { key: string; name: string },
      provider: 'qiniu' | 'r2',
    ) =>
      this.signUploadIntent({
        user,
        key: object.key,
        name: object.name,
        dir: data.dir,
        mimetype: data.mimetype,
        size: data.size,
        service: provider,
        expiresAt: Date.now() + expiresIn * 1000,
      });

    if (service === 'qiniu') {
      const object = this.createObjectKey(data.dir, data.filename, service);
      const token = await this.qiniuService.getPutPolicy(object.key);

      return {
        service,
        method: 'POST',
        uploadUrl: 'https://upload.qiniup.com',
        key: object.key,
        name: object.name,
        uploadToken: createIntent(object, service),
        fields: {
          key: object.key,
          token,
        },
        expiresIn,
      };
    }

    if (service === 'r2') {
      const object = this.createObjectKey(data.dir, data.filename, service);
      const uploadUrl = await this.r2Service.getPutObjectSignedUrl(
        object.key,
        data.mimetype,
      );

      return {
        service,
        method: 'PUT',
        uploadUrl,
        key: object.key,
        name: object.name,
        uploadToken: createIntent(object, service),
        headers: {
          'Content-Type': data.mimetype,
        },
        expiresIn,
      };
    }

    return {
      service,
      method: 'SERVER',
    };
  }

  async completeDirectUpload(data: CompleteDirectUploadDto, user: string) {
    const config = this.configService.get('storage-service');
    const intent = this.verifyUploadIntent(data.uploadToken);
    const service = intent.service;

    if (intent.user !== user) {
      throw new BadRequestException('上传凭证无效');
    }

    if (service !== config.service) {
      throw new BadRequestException('资源存储服务不匹配');
    }

    const exists = await this.resourceModel.exists({
      key: intent.key,
      service,
    });
    if (exists) {
      throw new BadRequestException('资源已登记');
    }

    let meta: { size?: number; mimetype?: string };
    try {
      meta =
        service === 'qiniu'
          ? await this.qiniuService.getFileMeta(intent.key)
          : await this.r2Service.getObjectMeta(intent.key);
    } catch {
      this.logger.warn(
        `Direct upload object not found: service=${service}, key=${intent.key}`,
      );
      throw new BadRequestException('上传文件不存在');
    }

    if (meta.size !== intent.size) {
      throw new BadRequestException('资源大小不匹配');
    }

    if (meta.mimetype && meta.mimetype !== intent.mimetype) {
      throw new BadRequestException('资源类型不匹配');
    }

    const url =
      service === 'qiniu'
        ? await this.qiniuService.getVisitUrl(intent.key)
        : await this.r2Service.getFileUrl(intent.key);

    return await this.resourceModel.create({
      name: intent.name,
      key: intent.key,
      dir: intent.dir,
      size: intent.size,
      mimetype: intent.mimetype,
      service,
      url,
      creator: user,
    });
  }

  private async downloadOriginalByService(
    service: Resource['service'],
    key: string,
  ) {
    if (service === 'local') return await this.localService.readFileBuffer(key);
    if (service === 'r2') return await this.r2Service.getObjectBuffer(key);
    if (service === 'qiniu')
      return await this.qiniuService.downloadFileBuffer(key);
    throw new BadRequestException('不支持的存储服务');
  }

  async getOriginalBuffer(resourceId: string) {
    if (!Types.ObjectId.isValid(resourceId)) {
      throw new BadRequestException('资源不存在');
    }

    const resource = await this.resourceModel.findById(resourceId);
    if (!resource) throw new BadRequestException('资源不存在');

    const buffer = await this.downloadOriginalByService(
      resource.service,
      resource.key,
    );
    if (!buffer?.length) throw new BadRequestException('无法读取原文件');

    return { resource, buffer };
  }

  private async readImageExifByExifTool(resourceId: string) {
    const { resource, buffer } = await this.getOriginalBuffer(resourceId);
    if (!resource.mimetype?.startsWith?.('image/')) {
      throw new BadRequestException('资源不是图片');
    }

    const ext = path.extname(resource.key || resource.name || '') || '.jpg';
    const tmpPath = path.join(
      os.tmpdir(),
      `resource-exif-${resourceId}-${Date.now()}${ext}`,
    );

    try {
      await fs.writeFile(tmpPath, buffer);
      const tags: any = await exiftool.read(tmpPath);
      return parseExifFromBuffer(undefined, {
        mode: 'exiftool',
        exiftoolTags: tags,
      });
    } finally {
      await fs.rm(tmpPath, { force: true });
    }
  }

  async readImageExif(resourceId: string, mode: ExifParseMode = 'sharp') {
    if (mode === 'exiftool') {
      return await this.readImageExifByExifTool(resourceId);
    }

    if (!Types.ObjectId.isValid(resourceId)) {
      throw new BadRequestException('资源不存在');
    }

    const resource = await this.resourceModel.findById(resourceId);
    if (!resource) throw new BadRequestException('资源不存在');
    if (!resource.mimetype?.startsWith?.('image/')) {
      throw new BadRequestException('资源不是图片');
    }

    const originalBuffer = await this.downloadOriginalByService(
      resource.service,
      resource.key,
    );
    if (!originalBuffer?.length) throw new BadRequestException('无法读取原图');

    const meta = await sharp(originalBuffer, { failOnError: false }).metadata();
    const parsedExif = parseExifFromBuffer(meta.exif, { mode: 'sharp' });

    return {
      ...parsedExif,
      width: meta.width,
      height: meta.height,
      orientation: meta.orientation,
      format: meta.format,
    };
  }

  async list(query: PageDto, service: string) {
    const { page = 1, pageSize = 10 } = query;

    const filter = service ? { service } : {};

    const resources = await this.resourceModel
      .find(filter)
      .populate('creator')
      .populate('updater')
      .sort({ createdAt: -1 }) // 按创建时间倒序
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();

    const total = await this.resourceModel.countDocuments(filter);

    return Response.page(resources, { page, pageSize, total });
  }

  async recycle(query: PageDto) {
    const { page = 1, pageSize = 10 } = query;
    const condition = {
      $or: [{ isDelete: true }, { isDelete: { $exists: false } }],
    };

    const total = await this.resourceModel.countDocuments(condition);

    // 添加 skipMiddleware 选项来禁用默认的查询中间件
    const resources = await this.resourceModel
      .find(condition)
      .setOptions({ skipMiddleware: true, skipToJson: true })
      .populate('creator')
      .populate('updater')
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean()
      .exec();

    return Response.page(resources, { page, pageSize, total });
  }

  // 上传文件
  async uploadFile(dir: string, file: Express.Multer.File, user) {
    const config = this.configService.get('storage-service');

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
      // 文件名+随机数字字母
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
        this.logger.error(
          `R2 upload failed: status=${r2Result.$metadata.httpStatusCode}, key=${key}`,
        );
        throw new BadRequestException('上传失败');
      }

      result.url = await this.r2Service.getFileUrl(key);
    }

    const dbResult = await this.resourceModel.create({
      ...result,
      creator: user,
    });

    return dbResult;
  }

  // 批量上传文件
  async uploadFiles(dir: string, files: Express.Multer.File[], user) {
    const results = await Promise.all(
      files.map((file) => this.uploadFile(dir, file, user)),
    );
    return results;
  }

  async processImageOne(
    resourceId: string,
    options: ResourceImageProcessOptions,
    user?: string,
  ): Promise<Resource> {
    try {
      return await this.resourceImageService.processImageOne(
        resourceId,
        options,
        user,
      );
    } catch (e: any) {
      throw new BadRequestException(e?.message || '图片处理失败');
    }
  }

  async processImages(
    resourceId: string,
    options: ResourceImageProcessOptions,
    user?: string,
  ): Promise<Resource[]> {
    try {
      return await this.resourceImageService.processImages(
        resourceId,
        options,
        user,
      );
    } catch (e: any) {
      throw new BadRequestException(e?.message || '图片处理失败');
    }
  }

  async getVisitUrlByDetail(detail: Resource) {
    const service = detail.service;

    let url: string | null = null;

    if (service === 'qiniu') {
      url = await this.qiniuService.getVisitUrl(detail.key);
    }

    if (service === 'local') {
      url = await this.localService.getVisitUrl(detail.key);
    }

    if (service === 'r2') {
      url = await this.r2Service.getFileUrl(detail.key);
    }

    return url;
  }

  //   获取访问链接
  async getVisitUrl(id: string) {
    const result = await this.resourceModel.findById(id);

    if (!result) {
      this.logger.warn(`Resource not found: id=${id}`);
      throw new BadRequestException('资源不存在');
    }

    return this.getVisitUrlByDetail(result);
  }

  /**
   * @name 批量获取访问链接
   */
  async getVisitUrls(ids: string[]) {
    const resources = await this.resourceModel.find({ _id: { $in: ids } });

    if (!resources) {
      this.logger.warn(`Resources not found: ids=${ids?.join(',')}`);
      throw new BadRequestException('资源不存在');
    }

    const result = await Promise.all(
      resources.map(async (resource) => ({
        _id: resource._id,
        url: await this.getVisitUrl(String(resource._id)),
      })),
    );

    return result;
  }

  // 根据 id 彻底删除文件，不可恢复
  // src\public\service\cleanup.service.ts
  async deleteFilePermanent(id: string) {
    const config = this.configService.get('storage-service');

    const resource = await this.resourceModel
      .findById(id)
      .setOptions({ skipMiddleware: true });

    if (!resource) {
      this.logger.warn(`Resource not found for delete: id=${id}`);
      throw new BadRequestException('资源不存在');
    }

    if (config.service === 'qiniu') {
      const result = await this.qiniuService.deleteFile(resource.key);

      return result;
    }

    if (config.service === 'local') {
      // 先尝试正常删除，如果失败则尝试强制删除
      let result = await this.localService.deleteFile(resource.key);

      // 如果正常删除失败且是文件不存在错误，尝试强制删除
      if (!result.success && result.error?.code === 'ENOENT') {
        result = await this.localService.deleteFile(resource.key, true);
      }

      if (result.success) {
        await this.resourceModel.findByIdAndDelete(id);
        await this.associationModel.deleteMany({ resourceId: id });
      }

      return result;
    }

    if (config.service === 'r2') {
      const result = await this.r2Service.deleteFile(resource.key);

      if (result.$metadata.httpStatusCode === 204) {
        await this.resourceModel.findByIdAndDelete(id);
        await this.associationModel.deleteMany({ resourceId: id });
      }

      return result;
    }
  }

  // 根据 id 删除文件
  async deleteFile(id: string) {
    const result = await this.resourceModel.findByIdAndUpdate(id, {
      isDelete: true,
    });

    return result;
  }

  // 回收站还原
  async restore(id: string) {
    const result = await this.resourceModel
      .findByIdAndUpdate(id, {
        isDelete: false,
      })
      .setOptions({ skipMiddleware: true });

    return result;
  }

  // 关联数据和资源
  async associateDataAndResource({
    resourceIds,
    associatedDataId,
    associatedDataFrom,
  }: {
    resourceIds: string[];
    associatedDataId: string;
    associatedDataFrom: string;
  }) {
    const result = await this.associationModel.create(
      resourceIds.map((resourceId) => ({
        resourceId,
        associatedDataId,
        associatedDataFrom,
      })),
    );

    return result;
  }

  async disassociateDataAndResourceByDataId(associatedDataId: string) {
    // 先找到所有关联的资源ID
    const associations = await this.associationModel.find({ associatedDataId });
    const resourceIds = associations.map(
      (association) => association.resourceId,
    );

    if (resourceIds.length > 0) {
      // 将这些资源标记为已删除
      await this.resourceModel.updateMany(
        { _id: { $in: resourceIds } },
        { isDelete: true },
      );
      // 删除关联关系
      await this.associationModel.deleteMany({ associatedDataId });
    }
  }

  async disassociateDataAndResource(
    associatedDataId: string,
    resourceIds: string[],
  ) {
    if (!resourceIds?.length) return [];
    await this.resourceModel.updateMany(
      { _id: { $in: resourceIds } },
      { isDelete: true },
    );
    await this.associationModel.deleteMany({
      associatedDataId,
      resourceId: { $in: resourceIds },
    });
    return resourceIds;
  }

  // 获取关联数据
  async getAssociatedData(resourceId: string) {
    const associations = await this.associationModel.find({ resourceId });

    if (!associations.length) {
      return [];
    }

    return associations.map((association) => ({
      resourceId: association.resourceId,
      associatedDataId: association.associatedDataId,
      associatedDataFrom: association.associatedDataFrom,
      data: null,
    }));
  }

  // 获取资源详情和关联数据
  async getResourceDetail(id: string): Promise<any> {
    const resource = await this.resourceModel
      .findById(id)
      .populate('creator')
      .lean();

    if (!resource) {
      this.logger.warn(`Resource detail not found: id=${id}`);
      throw new BadRequestException('资源不存在');
    }

    const associatedData = await this.getAssociatedData(id);

    return {
      ...resource,
      url: await this.getVisitUrlByDetail(resource as unknown as Resource),
      associatedData,
    };
  }

  async getResourceByKey(key: string): Promise<Resource | null> {
    return this.resourceModel.findOne({ key });
  }

  /**
   * 从图片链接获取对应的资源
   */
  async getResourceByImageUrl(imageUrl: string): Promise<Resource | null> {
    const url = new URL(imageUrl);
    const key = url.pathname.split('/').pop(); // 提取文件名部分
    if (!key) return null;
    return await this.getResourceByKey(key);
  }

  async replaceImageLinks(content: string): Promise<string> {
    const imageRegex = /!\[.*?\]\((.*?)\)/g;
    const matches = [...content.matchAll(imageRegex)];

    for (const match of matches) {
      const imageUrl = match[1];
      // 检查是否为有效的url
      try {
        new URL(imageUrl);
      } catch {
        continue;
      }
      const resource = await this.getResourceByImageUrl(imageUrl);
      if (resource) {
        const newUrl = await this.getVisitUrlByDetail(resource);
        content = content.replace(imageUrl, newUrl);
      }
    }

    return content;
  }

  /**
   * 从给定的String中获取所有资源并关联，允许附加资源数组作为额外关联数据
   */
  async associateResourcesFromStringOrArray({
    associatedDataId,
    associatedDataFrom,
    content,
    resources = [],
    resourceIds = [],
  }: {
    associatedDataId: string;
    associatedDataFrom: string;
    content?: string;
    resources?: Resource[];
    resourceIds?: string[];
  }) {
    const needAssociateResourceIds = [];

    if (content) {
      const imageRegex = /!\[.*?\]\((.*?)\)/g;
      const matches = [...content.matchAll(imageRegex)];
      for (const match of matches) {
        const imageUrl = match[1];
        try {
          new URL(imageUrl);
        } catch {
          continue;
        }

        const resource = await this.getResourceByImageUrl(imageUrl);
        if (resource) {
          resourceIds.push(String(resource._id));
        }
      }
    }

    if (resources.length) {
      const resourceIds = resources.map((resource) => resource._id);
      needAssociateResourceIds.push(...resourceIds);
    }

    if (resourceIds.length) {
      needAssociateResourceIds.push(...resourceIds);
    }

    if (needAssociateResourceIds.length) {
      const result = await this.associateDataAndResource({
        resourceIds: needAssociateResourceIds,
        associatedDataId,
        associatedDataFrom,
      });

      return result;
    }

    return [];
  }
}
