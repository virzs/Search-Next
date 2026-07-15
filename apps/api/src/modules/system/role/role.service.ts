import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PageDto } from 'src/public/dto/page';
import {
  Role,
  SYSTEM_ADMIN_ROLE_CODE,
} from 'src/modules/system/role/schemas/role';
import { CreateRoleDto } from './dto/create-role.dto';
import { Response } from 'src/utils/response';
import { Permission } from 'src/schemas/permission';

@Injectable()
export class RoleService implements OnModuleInit {
  constructor(
    @InjectModel(Role.name) private readonly roleModel: Model<Role>,
    @InjectModel(Permission.name)
    private readonly permissionModel: Model<Permission>,
  ) {}

  async onModuleInit() {
    const systemRole = await this.roleModel
      .findOne({
        $or: [{ code: SYSTEM_ADMIN_ROLE_CODE }, { name: '系统管理员' }],
      })
      .exec();

    if (systemRole) {
      await this.roleModel
        .findByIdAndUpdate(systemRole._id, {
          code: SYSTEM_ADMIN_ROLE_CODE,
          name: '系统管理员',
          description: '系统内置角色，拥有所有接口权限',
          permissions: [],
          isSystem: true,
          isSuperAdmin: true,
        })
        .exec();
      return;
    }

    await this.roleModel.create({
      code: SYSTEM_ADMIN_ROLE_CODE,
      name: '系统管理员',
      description: '系统内置角色，拥有所有接口权限',
      permissions: [],
      isSystem: true,
      isSuperAdmin: true,
    });
  }

  async page(query: PageDto) {
    const { page = 1, pageSize = 10 } = query;

    const roles = await this.roleModel
      .find()
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .populate('creator')
      .populate('updater')
      .populate('permissions')
      .exec();

    const total = await this.roleModel.countDocuments();

    return Response.page(roles, { page, pageSize, total });
  }

  async detail(id: string) {
    const role = await this.roleModel
      .findById(id)
      .populate('creator')
      .populate('updater')
      .populate('permissions');
    return role;
  }

  async detailPermissions(
    id: string,
  ): Promise<Record<string, unknown> | null> {
    const role = await this.roleModel.findById(id).lean().exec();
    if (!role) {
      return null;
    }

    return {
      ...role,
      permissions: await this.getAssignablePermissionIds(role.permissions),
    };
  }

  async create(body: CreateRoleDto, user: string) {
    const permissions = await this.getAssignablePermissionIds(body.permissions);
    const result = await this.roleModel.create({
      ...body,
      permissions,
      creator: user,
    });
    return result;
  }

  async update(id: string, body: CreateRoleDto, user: string) {
    const role = await this.roleModel.findById(id).exec();

    if (role?.isSystem) {
      throw new BadRequestException('系统内置角色不能修改');
    }

    const permissions = await this.getAssignablePermissionIds(body.permissions);
    const result = await this.roleModel.findByIdAndUpdate(id, {
      ...body,
      permissions,
      updater: user,
    });
    return result;
  }

  async delete(id: string) {
    const role = await this.roleModel.findById(id).exec();

    if (role?.isSystem) {
      throw new BadRequestException('系统内置角色不能删除');
    }

    const result = await this.roleModel.findByIdAndDelete(id);
    return result;
  }

  async list() {
    const roles = await this.roleModel.find();
    return roles;
  }

  private async getAssignablePermissionIds(
    permissions: unknown[] = [],
  ): Promise<string[]> {
    if (!permissions.length) {
      return [];
    }

    const result = await this.permissionModel
      .find({
        _id: { $in: permissions },
        type: 1,
        isStale: { $ne: true },
      })
      .select('_id')
      .lean()
      .exec();

    return result.map((permission) => permission._id.toString());
  }
}
