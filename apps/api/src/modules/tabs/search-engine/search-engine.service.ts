import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { Model, Types } from 'mongoose';
import { Response } from 'src/utils/response';
import { SearchEngine, SearchEngineName } from './schemas/search-engine.schema';
import {
  CreateSearchEngineDto,
  UpdateSearchEngineDto,
} from './dto/search-engine.dto';

type SearchEngineExportItem = Pick<
  CreateSearchEngineDto,
  | 'name'
  | 'description'
  | 'searchUrl'
  | 'suggestUrl'
  | 'jsonpCode'
  | 'icon'
  | 'isEnabled'
>;

type ImportErrorItem = {
  index: number;
  key?: string;
  message: string;
};

type ImportResult = {
  total: number;
  created: number;
  updated: number;
  restored: number;
  failed: number;
  errors: ImportErrorItem[];
};

@Injectable()
export class SearchEngineService {
  constructor(
    @InjectModel(SearchEngineName)
    private readonly searchEngineModel: Model<SearchEngine>,
  ) {}

  async page(query: { page?: number; pageSize?: number }) {
    const { page = 1, pageSize = 10 } = query;
    const finder = {};

    const data = await this.searchEngineModel
      .find(finder)
      .populate('creator', 'username')
      .populate('updater', 'username')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();
    const total = await this.searchEngineModel.countDocuments(finder);

    return Response.page(data, { page, pageSize, total });
  }

  async listEnabled() {
    return this.searchEngineModel
      .find({ isEnabled: true })
      .select('_id name description icon searchUrl suggestUrl jsonpCode')
      .lean()
      .exec();
  }

  async exportAll() {
    const rows = await this.searchEngineModel
      .find({})
      .select(
        '-_id name description searchUrl suggestUrl jsonpCode icon isEnabled',
      )
      .lean()
      .exec();

    return {
      schemaVersion: 1,
      type: 'search-engine',
      exportedAt: new Date().toISOString(),
      items: rows.map((row) => this.toExportItem(row)),
    };
  }

  async importAll(payload: unknown, user?: string): Promise<ImportResult> {
    const items = this.getImportItems(payload, 'search-engine');
    const result: ImportResult = {
      total: items.length,
      created: 0,
      updated: 0,
      restored: 0,
      failed: 0,
      errors: [],
    };

    for (const [index, raw] of items.entries()) {
      const rowNumber = index + 1;
      const key = this.getImportKey(raw, 'name');

      try {
        const normalizedRaw = this.normalizeImportItem(raw);
        const validation = await this.validateDto(
          CreateSearchEngineDto,
          normalizedRaw,
        );

        if (!validation.data) {
          this.pushImportError(result, rowNumber, key, validation.message);
          continue;
        }

        const data = validation.data;
        const existing = await this.searchEngineModel.collection.findOne({
          name: data.name,
        });

        if (existing) {
          const wasDeleted = Boolean(existing.isDelete);
          await this.searchEngineModel.collection.updateOne(
            { _id: existing._id },
            {
              $set: {
                ...data,
                isDelete: false,
                updater: this.toObjectId(user),
                updatedAt: new Date(),
              },
            },
          );
          if (wasDeleted) {
            result.restored += 1;
          } else {
            result.updated += 1;
          }
          continue;
        }

        await this.searchEngineModel.create({
          ...data,
          creator: user,
        });
        result.created += 1;
      } catch (error) {
        this.pushImportError(result, rowNumber, key, this.errorMessage(error));
      }
    }

    result.failed = result.errors.length;
    return result;
  }

  async create(dto: CreateSearchEngineDto, user?: string) {
    const created = await this.searchEngineModel.create({
      ...dto,
      creator: user,
    });
    return created;
  }

  async update(id: string, dto: UpdateSearchEngineDto, user?: string) {
    const updated = await this.searchEngineModel.findByIdAndUpdate(
      id,
      { ...dto, updater: user },
      { new: true },
    );
    return updated;
  }

  async setEnable(id: string, isEnabled: boolean, user?: string) {
    return this.searchEngineModel.findByIdAndUpdate(
      id,
      { isEnabled, updater: user },
      { new: true },
    );
  }

  async toggleEnable(id: string, user?: string) {
    const doc = await this.searchEngineModel.findById(id).exec();
    if (!doc) return null;
    const next = !doc.isEnabled;
    return this.searchEngineModel.findByIdAndUpdate(
      id,
      { isEnabled: next, updater: user },
      { new: true },
    );
  }

  async delete(id: string) {
    return this.searchEngineModel.findByIdAndUpdate(id, { isDelete: true });
  }

  async detail(id: string) {
    return this.searchEngineModel.findById(id).exec();
  }

  private getImportItems(payload: unknown, expectedType: string) {
    if (Array.isArray(payload)) return payload;
    if (!payload || typeof payload !== 'object') {
      throw new BadRequestException('导入文件格式不正确');
    }

    const body = payload as { type?: unknown; items?: unknown };
    if (body.type !== undefined && body.type !== expectedType) {
      throw new BadRequestException('导入文件类型不匹配');
    }
    if (!Array.isArray(body.items)) {
      throw new BadRequestException('导入文件缺少 items 数组');
    }
    return body.items;
  }

  private normalizeImportItem(raw: unknown) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return raw;
    const item = raw as Record<string, unknown>;
    return {
      ...item,
      name: this.trimString(item.name),
      description: this.trimString(item.description),
      searchUrl: this.trimString(item.searchUrl),
      suggestUrl: this.trimString(item.suggestUrl),
      icon: this.trimString(item.icon),
    };
  }

  private async validateDto<T extends object>(
    dtoClass: new () => T,
    raw: unknown,
  ): Promise<{ data?: T; message?: string }> {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      return { message: '导入项必须是对象' };
    }

    const object = plainToInstance(dtoClass, raw, {
      excludeExtraneousValues: true,
    });
    const plain = instanceToPlain(object) as Record<string, unknown>;
    for (const key of Object.keys(plain)) {
      if (plain[key] === undefined) {
        delete plain[key];
      }
    }

    const errors = await validate(plainToInstance(dtoClass, plain));
    if (errors.length > 0) {
      return { message: this.getFirstValidationMessage(errors) };
    }

    return { data: plain as T };
  }

  private toExportItem(row: any): SearchEngineExportItem {
    return {
      name: row.name,
      description: row.description,
      searchUrl: row.searchUrl,
      suggestUrl: row.suggestUrl,
      jsonpCode: row.jsonpCode,
      icon: row.icon,
      isEnabled: row.isEnabled,
    };
  }

  private pushImportError(
    result: ImportResult,
    index: number,
    key: string | undefined,
    message = '导入失败',
  ) {
    result.errors.push({ index, key, message });
  }

  private getImportKey(raw: unknown, key: string) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined;
    const value = (raw as Record<string, unknown>)[key];
    return typeof value === 'string' ? value.trim() : undefined;
  }

  private trimString(value: unknown) {
    return typeof value === 'string' ? value.trim() : value;
  }

  private toObjectId(value?: string) {
    return value && Types.ObjectId.isValid(value)
      ? new Types.ObjectId(value)
      : value;
  }

  private errorMessage(error: unknown) {
    return error instanceof Error ? error.message : String(error || '导入失败');
  }

  private getFirstValidationMessage(errors: ValidationError[]): string {
    for (const error of errors) {
      if (error.constraints) {
        return Object.values(error.constraints)[0];
      }
      if (error.children?.length) {
        return this.getFirstValidationMessage(error.children);
      }
    }
    return '参数校验失败';
  }
}
