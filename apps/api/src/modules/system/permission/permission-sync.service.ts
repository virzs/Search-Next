import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { DiscoveryService, MetadataScanner } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permission } from 'src/schemas/permission';
import {
  getRequestMethodName,
  getRoutePermissionPaths,
  normalizePermissionPath,
  toPathList,
} from './permission-route.util';
import { PUBLIC_ROUTE_KEY } from 'src/public/decorator/public_route.decorator';

const SWAGGER_API_TAGS = 'swagger/apiUseTags';
const SWAGGER_API_OPERATION = 'swagger/apiOperation';
const PATH_SEGMENT_LABELS: Record<string, string> = {
  ai: 'AI',
  auth: '授权',
  message: '消息',
  resource: '资源',
  system: '系统',
  tabs: '新标签页',
  users: '用户',
};

export interface RoutePermissionDefinition {
  syncKey: string;
  method: string;
  url: string;
  name: string;
  description?: string;
  groupPath: string[];
}

interface AutoPermissionInput {
  syncKey: string;
  name: string;
  description?: string;
  url?: string;
  method?: string;
  type: number;
  parent?: unknown;
}

@Injectable()
export class PermissionSyncService implements OnApplicationBootstrap {
  private readonly logger = new Logger(PermissionSyncService.name);

  constructor(
    @InjectModel(Permission.name)
    private readonly permissionModel: Model<Permission>,
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
  ) {}

  async onApplicationBootstrap() {
    try {
      await this.syncRoutePermissions();
    } catch (error) {
      this.logger.error(
        '自动同步接口权限失败',
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  collectRoutePermissions(): RoutePermissionDefinition[] {
    const definitions = new Map<string, RoutePermissionDefinition>();
    const controllers = this.discoveryService.getControllers();

    for (const wrapper of controllers) {
      const { instance, metatype } = wrapper;
      if (!instance || !metatype) {
        continue;
      }

      const controllerPaths = toPathList(
        Reflect.getMetadata(PATH_METADATA, metatype),
      );
      const prototype = Object.getPrototypeOf(instance);
      const methodNames = this.metadataScanner.getAllMethodNames(prototype);

      for (const methodName of methodNames) {
        const handler = instance[methodName];
        const requestMethod = Reflect.getMetadata(METHOD_METADATA, handler);
        const method = getRequestMethodName(requestMethod);

        if (!method || this.shouldSkipRoute(metatype, handler)) {
          continue;
        }

        const handlerPaths = Reflect.getMetadata(PATH_METADATA, handler);

        for (const controllerPath of controllerPaths) {
          for (const url of getRoutePermissionPaths(
            controllerPath,
            handlerPaths,
          )) {
            const syncKey = this.getRouteSyncKey(method, url);
            definitions.set(syncKey, {
              syncKey,
              method,
              url,
              name: this.getOperationName(handler, method, url),
              description: this.getOperationDescription(handler),
              groupPath: this.getGroupPath(handler, metatype, controllerPath),
            });
          }
        }
      }
    }

    return [...definitions.values()].sort((a, b) => {
      const groupCompare = a.groupPath.join('/').localeCompare(
        b.groupPath.join('/'),
      );
      if (groupCompare !== 0) {
        return groupCompare;
      }
      return `${a.method} ${a.url}`.localeCompare(`${b.method} ${b.url}`);
    });
  }

  async syncRoutePermissions(definitions = this.collectRoutePermissions()) {
    const now = new Date();
    const activeSyncKeys = new Set<string>();
    const groupCache = new Map<string, Permission>();

    for (const definition of definitions) {
      const parent = await this.ensureGroupPath(
        definition.groupPath,
        activeSyncKeys,
        groupCache,
        now,
      );

      activeSyncKeys.add(definition.syncKey);
      await this.upsertAutoPermission(
        {
          syncKey: definition.syncKey,
          name: definition.name,
          description: definition.description,
          url: definition.url,
          method: definition.method,
          type: 1,
          parent: parent?._id ?? null,
        },
        now,
        {
          method: definition.method,
          url: definition.url,
        },
      );
    }

    await this.markStaleAutoPermissions(activeSyncKeys, now);
    this.logger.log(`接口权限同步完成，共 ${definitions.length} 个接口`);
  }

  private async ensureGroupPath(
    groupPath: string[],
    activeSyncKeys: Set<string>,
    groupCache: Map<string, Permission>,
    now: Date,
  ) {
    let parent = null;
    const pathParts: string[] = [];

    for (const name of groupPath) {
      pathParts.push(name);
      const syncKey = this.getGroupSyncKey(pathParts);
      activeSyncKeys.add(syncKey);

      const cached = groupCache.get(syncKey);
      if (cached) {
        parent = cached;
        continue;
      }

      const group = await this.upsertAutoPermission(
        {
          syncKey,
          name,
          type: 0,
          parent: parent?._id ?? null,
        },
        now,
        {
          name,
          type: 0,
          parent: parent?._id ?? null,
        },
      );

      groupCache.set(syncKey, group);
      parent = group;
    }

    return parent;
  }

  private async upsertAutoPermission(
    input: AutoPermissionInput,
    now: Date,
    fallbackQuery?: Record<string, unknown>,
  ): Promise<Permission> {
    const existing = await this.findExistingPermission(input, fallbackQuery);

    const $set: Record<string, unknown> = {
      name: input.name,
      type: input.type,
      parent: input.parent ?? null,
      source: 'auto',
      syncKey: input.syncKey,
      isStale: false,
      lastSyncedAt: now,
    };
    const $unset: Record<string, string> = {
      staleSince: '',
    };

    if (input.description) {
      $set.description = input.description;
    } else {
      $unset.description = '';
    }

    if (input.url) {
      $set['url'] = normalizePermissionPath(input.url);
    } else {
      $unset.url = '';
    }

    if (input.method) {
      $set['method'] = input.method;
    } else {
      $unset.method = '';
    }

    if (existing) {
      await this.permissionModel
        .updateOne({ _id: existing._id }, { $set, $unset })
        .exec();
      Object.assign(existing, $set);
      delete existing.staleSince;
      return existing;
    }

    return this.permissionModel.create($set);
  }

  private async findExistingPermission(
    input: AutoPermissionInput,
    fallbackQuery?: Record<string, unknown>,
  ) {
    const existingBySyncKey = await this.permissionModel
      .findOne({ syncKey: input.syncKey })
      .exec();

    if (existingBySyncKey) {
      return existingBySyncKey;
    }

    if (input.method && input.url) {
      const normalizedUrl = normalizePermissionPath(input.url);
      const candidates = await this.permissionModel
        .find({ method: input.method })
        .exec();
      const existingByRoute = candidates.find(
        (item) => normalizePermissionPath(item.url) === normalizedUrl,
      );

      if (existingByRoute) {
        return existingByRoute;
      }
    }

    if (input.type === 0 && input.name) {
      const groupCandidates = await this.permissionModel
        .find({ name: input.name, type: 0, source: 'auto' })
        .exec();

      if (groupCandidates.length === 1) {
        return groupCandidates[0];
      }
    }

    if (fallbackQuery) {
      return this.permissionModel.findOne(fallbackQuery).exec();
    }

    return null;
  }

  private async markStaleAutoPermissions(
    activeSyncKeys: Set<string>,
    now: Date,
  ) {
    const query =
      activeSyncKeys.size > 0
        ? {
            source: 'auto',
            syncKey: { $nin: [...activeSyncKeys] },
            isStale: { $ne: true },
          }
        : {
            source: 'auto',
            isStale: { $ne: true },
          };

    await this.permissionModel
      .updateMany(query, {
        $set: {
          isStale: true,
          staleSince: now,
        },
      })
      .exec();
  }

  private shouldSkipRoute(controller: unknown, handler: unknown) {
    const publicRoute = this.getMetadata(PUBLIC_ROUTE_KEY, controller, handler);
    if (publicRoute) {
      return true;
    }

    const optionalLogin = this.getMetadata('optional-login', controller, handler);
    if (optionalLogin) {
      return true;
    }

    const skipPermission = this.getMetadata(
      'skip-permission',
      controller,
      handler,
    );
    return !!skipPermission;
  }

  private getMetadata<T = unknown>(
    key: string,
    controller: unknown,
    handler: unknown,
  ): T | undefined {
    const handlerValue = Reflect.getMetadata(key, handler as object);
    if (handlerValue !== undefined) {
      return handlerValue;
    }
    return Reflect.getMetadata(key, controller as object);
  }

  private getGroupPath(
    handler: unknown,
    controller: unknown,
    controllerPath: string,
  ) {
    const fallbackPath = this.getFallbackGroupPath(controllerPath);
    const tagPath = this.getTagGroupPath(handler, controller);

    if (tagPath.length === 0) {
      return fallbackPath;
    }

    if (fallbackPath.length === 0) {
      return tagPath;
    }

    if (tagPath[0] === fallbackPath[0]) {
      return tagPath;
    }

    if (fallbackPath.length === 1) {
      return tagPath;
    }

    return [fallbackPath[0], ...tagPath];
  }

  private getTagGroupPath(handler: unknown, controller: unknown) {
    const tags = this.getSwaggerTags(handler) ?? this.getSwaggerTags(controller);
    const tag = Array.isArray(tags) ? tags[0] : tags;

    if (!tag) {
      return [];
    }

    return String(tag)
      .split('/')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  private getFallbackGroupPath(controllerPath: string) {
    const normalizedPath = normalizePermissionPath(controllerPath);
    const segments = normalizedPath
      .split('/')
      .map((item) => item.trim())
      .filter(Boolean)
      .filter((item) => !item.startsWith(':'))
      .map((item) => PATH_SEGMENT_LABELS[item] ?? item);

    return segments.length > 0 ? segments : ['接口'];
  }

  private getSwaggerTags(target: unknown): string[] | undefined {
    return Reflect.getMetadata(SWAGGER_API_TAGS, target as object);
  }

  private getOperationName(handler: unknown, method: string, url: string) {
    const operation = this.getOperation(handler);
    const name = operation?.summary || operation?.description;

    if (name?.trim()) {
      return name.trim();
    }

    this.logger.warn(
      `${method} ${url} 缺少 @ApiOperation 名称，已使用路由作为权限名称`,
    );
    return `${method} ${url}`;
  }

  private getOperationDescription(handler: unknown) {
    return this.getOperation(handler)?.description;
  }

  private getOperation(handler: unknown) {
    return Reflect.getMetadata(SWAGGER_API_OPERATION, handler as object) as
      | {
          summary?: string;
          description?: string;
        }
      | undefined;
  }

  private getRouteSyncKey(method: string, url: string) {
    return `permission-route:${method}:${normalizePermissionPath(url)}`;
  }

  private getGroupSyncKey(pathParts: string[]) {
    return `permission-group:${pathParts.join('/')}`;
  }
}
