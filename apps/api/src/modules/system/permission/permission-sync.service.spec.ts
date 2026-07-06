import { Controller, Get, Post } from '@nestjs/common';
import { MetadataScanner } from '@nestjs/core';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequireLogin } from 'src/public/decorator/require_login.decorator';
import { SkipPermission } from 'src/public/decorator/skip_permission.decorator';
import { PermissionSyncService } from './permission-sync.service';

class FakeQuery<T> {
  constructor(private readonly value: T) {}

  async exec() {
    return this.value;
  }
}

class FakePermissionModel {
  private nextId = 1;

  constructor(public readonly docs: any[] = []) {}

  findOne(query: Record<string, any>) {
    return new FakeQuery(this.docs.find((doc) => matchesQuery(doc, query)) ?? null);
  }

  find(query: Record<string, any>) {
    return new FakeQuery(this.docs.filter((doc) => matchesQuery(doc, query)));
  }

  async create(data: Record<string, any>) {
    const doc = { _id: `permission-${this.nextId++}`, ...data };
    this.docs.push(doc);
    return doc;
  }

  updateOne(query: Record<string, any>, update: Record<string, any>) {
    const doc = this.docs.find((item) => matchesQuery(item, query));
    if (doc) {
      applyUpdate(doc, update);
    }
    return new FakeQuery({ modifiedCount: doc ? 1 : 0 });
  }

  updateMany(query: Record<string, any>, update: Record<string, any>) {
    let modifiedCount = 0;
    for (const doc of this.docs) {
      if (matchesQuery(doc, query)) {
        applyUpdate(doc, update);
        modifiedCount += 1;
      }
    }
    return new FakeQuery({ modifiedCount });
  }
}

const matchesQuery = (doc: Record<string, any>, query: Record<string, any>) => {
  return Object.entries(query).every(([key, expected]) => {
    const actual = doc[key];

    if (expected && typeof expected === 'object' && !Array.isArray(expected)) {
      if ('$nin' in expected) {
        return !expected.$nin.includes(actual);
      }
      if ('$ne' in expected) {
        return actual !== expected.$ne;
      }
    }

    if (expected === null) {
      return actual === null || actual === undefined;
    }

    return actual === expected;
  });
};

const applyUpdate = (doc: Record<string, any>, update: Record<string, any>) => {
  Object.assign(doc, update.$set ?? {});
  for (const key of Object.keys(update.$unset ?? {})) {
    delete doc[key];
  }
};

const createService = (
  controllers: object[] = [],
  permissionModel = new FakePermissionModel(),
) => {
  const discoveryService = {
    getControllers: () =>
      controllers.map((instance) => ({
        instance,
        metatype: instance.constructor,
      })),
  };

  return new PermissionSyncService(
    permissionModel as any,
    discoveryService as any,
    new MetadataScanner(),
  );
};

@ApiTags('系统/通知')
@Controller('system/notice')
class NoticeController {
  @Get('/')
  @ApiOperation({ summary: '通知分页' })
  list() {}

  @Get('/:id')
  @ApiOperation({ description: '通知详情' })
  detail() {}

  @Post('/public')
  @RequireLogin()
  publicRoute() {}

  @Get('/skip')
  @SkipPermission()
  skippedRoute() {}
}

@ApiTags('项目')
@Controller('system/project')
class ProjectController {
  @Get('/')
  @ApiOperation({ summary: '项目详情' })
  detail() {}
}

describe('PermissionSyncService', () => {
  it('collects guarded routes and uses ApiOperation as endpoint names', () => {
    const service = createService([
      new NoticeController(),
      new ProjectController(),
    ]);

    const definitions = service.collectRoutePermissions();

    expect(definitions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          method: 'GET',
          url: '/system/notice',
          name: '通知分页',
          groupPath: ['系统', '通知'],
        }),
        expect.objectContaining({
          method: 'GET',
          url: '/system/notice/:id',
          name: '通知详情',
          groupPath: ['系统', '通知'],
        }),
        expect.objectContaining({
          method: 'GET',
          url: '/system/project',
          name: '项目详情',
          groupPath: ['系统', '项目'],
        }),
      ]),
    );
    expect(definitions.some((item) => item.url.endsWith('/public'))).toBe(false);
    expect(definitions.some((item) => item.url.endsWith('/skip'))).toBe(false);
  });

  it('migrates manual route permissions and marks removed auto routes stale', async () => {
    const permissionModel = new FakePermissionModel([
      {
        _id: 'manual-route',
        name: '旧通知分页',
        url: '/system/notice/',
        method: 'GET',
        type: 1,
        source: 'manual',
        isStale: false,
      },
      {
        _id: 'old-project-group',
        name: '项目',
        description: '接口权限分组',
        type: 0,
        source: 'auto',
        syncKey: 'permission-group:项目',
        isStale: false,
      },
      {
        _id: 'removed-route',
        name: '旧接口',
        url: '/old',
        method: 'GET',
        type: 1,
        source: 'auto',
        syncKey: 'permission-route:GET:/old',
        isStale: false,
      },
    ]);
    const service = createService([], permissionModel);

    await service.syncRoutePermissions([
      {
        syncKey: 'permission-route:GET:/system/notice',
        method: 'GET',
        url: '/system/notice',
        name: '通知分页',
        description: '通知分页描述',
        groupPath: ['系统', '通知'],
      },
      {
        syncKey: 'permission-route:GET:/system/project',
        method: 'GET',
        url: '/system/project',
        name: '项目详情',
        groupPath: ['系统', '项目'],
      },
    ]);

    const migrated = permissionModel.docs.find((item) => item._id === 'manual-route');
    const removed = permissionModel.docs.find((item) => item._id === 'removed-route');
    const systemGroup = permissionModel.docs.find(
      (item) => item.syncKey === 'permission-group:系统',
    );
    const projectGroup = permissionModel.docs.find(
      (item) => item._id === 'old-project-group',
    );

    expect(permissionModel.docs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: '系统',
          source: 'auto',
          syncKey: 'permission-group:系统',
          isStale: false,
        }),
        expect.objectContaining({
          name: '通知',
          source: 'auto',
          syncKey: 'permission-group:系统/通知',
          isStale: false,
        }),
      ]),
    );
    expect(projectGroup).toEqual(
      expect.objectContaining({
        name: '项目',
        source: 'auto',
        syncKey: 'permission-group:系统/项目',
        parent: systemGroup._id,
        isStale: false,
      }),
    );
    expect(projectGroup).not.toHaveProperty('description');
    expect(migrated).toEqual(
      expect.objectContaining({
        name: '通知分页',
        source: 'auto',
        syncKey: 'permission-route:GET:/system/notice',
        url: '/system/notice',
        method: 'GET',
        isStale: false,
      }),
    );
    expect(removed).toEqual(
      expect.objectContaining({
        isStale: true,
      }),
    );
    expect(removed.staleSince).toBeInstanceOf(Date);
  });
});
