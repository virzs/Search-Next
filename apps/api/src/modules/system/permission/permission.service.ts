import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Permission } from 'src/schemas/permission';
import { Model } from 'mongoose';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { TreeDto } from './dto/tree.dto';

@Injectable()
export class PermissionService {
  constructor(
    @InjectModel(Permission.name)
    private readonly permissionModel: Model<Permission>,
  ) {}

  async list() {
    return await this.permissionModel.find().exec();
  }

  async getTree(params?: TreeDto, parentId = null, level = 0) {
    const result = await this.permissionModel.find({
      parent: parentId,
      name: new RegExp(params?.name ?? '', 'i'),
    });
    for (let i = 0; i < result.length; i++) {
      result[i].level = level;
      const children = await this.getTree(params, result[i]._id, level + 1);
      if (children.length > 0) {
        // children 排序，如果有 children 则按创建时间排到前面，如果没有 则按创建时间排序
        children.sort((a, b) => {
          if (a.children && b.children) {
            return a.createdAt.getTime() - b.createdAt.getTime();
          } else if (a.children && !b.children) {
            return -1;
          } else if (!a.children && b.children) {
            return 1;
          } else {
            return a.createdAt.getTime() - b.createdAt.getTime();
          }
        });
        result[i].children = children;
      } else {
        result[i].children = null;
      }
    }
    return result;
  }

  async treeInfo(query: TreeDto) {
    return await this.getTree(query);
  }

  async create(body: CreatePermissionDto) {
    return await this.permissionModel.create(body);
  }

  async update(id: string, body: UpdatePermissionDto) {
    return await this.permissionModel.findByIdAndUpdate(id, body);
  }

  async deleteAll(id: string) {
    const children = await this.permissionModel.find({ parent: id });
    const el = await this.permissionModel.findByIdAndDelete(id);
    if (children && children.length > 0) {
      await this.permissionModel.deleteMany({ parent: id });
      for (const child of children) {
        this.deleteAll(child._id.toString());
      }
    }
    return el;
  }

  async delete(id: string) {
    return this.deleteAll(id);
  }

  async detail(id: string) {
    return this.permissionModel.findById(id);
  }
}
