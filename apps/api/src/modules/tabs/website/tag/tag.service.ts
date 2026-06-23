import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WebsiteTagName, WebsiteName } from '../schemas/ref-names';
import { WebsiteTag } from '../schemas/tag';
import { Website } from '../schemas/website';
import {
  TagDto,
  TagForAdminDto,
  TagForUserDto,
  UpdateTagDto,
  TagWebsiteRelationDto,
  BatchUpdateTagStatusDto,
  QuickCreateTagDto,
  SearchTagDto,
} from '../dto/tag';

@Injectable()
export class TagService {
  constructor(
    @InjectModel(WebsiteTagName) private tagModel: Model<WebsiteTag>,
    @InjectModel(WebsiteName) private websiteModel: Model<Website>,
  ) {}

  /**
   * 获取标签分页 (后台)
   */
  async getTags(query: TagForAdminDto) {
    const { page = 1, pageSize = 10, search, enable } = query;

    // 构建查询条件
    const finder: any = {};

    // 搜索条件
    if (search) {
      finder.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // 启用状态筛选
    if (typeof enable === 'boolean') {
      finder.enable = enable;
    }

    const tags = await this.tagModel
      .find(finder)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .populate('websites')
      .sort({ sort: 1, createdAt: -1 })
      .exec();

    const total = await this.tagModel.countDocuments(finder);

    return { data: tags, page, pageSize, total };
  }

  /**
   * 获取标签分页 (用户)
   */
  async getTagsForUser(query: TagForUserDto) {
    const { page = 1, pageSize = 10, search } = query;

    const finder: any = {
      enable: true,
    };

    // 搜索条件
    if (search) {
      finder.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const tags = await this.tagModel
      .find(finder)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .sort({ sort: 1, createdAt: -1 })
      .exec();

    const total = await this.tagModel.countDocuments(finder);

    return { data: tags, page, pageSize, total };
  }

  /**
   * 获取所有启用的标签 (不分页)
   */
  async getAllEnabledTags() {
    const tags = await this.tagModel
      .find({ enable: true })
      .sort({ sort: 1, createdAt: -1 })
      .exec();

    return tags;
  }

  /**
   * 根据名称搜索标签列表 (不分页)
   */
  async searchTagsByName(data: SearchTagDto) {
    const { search } = data;

    let finder: any = {
      enable: true,
    };

    if (search) {
      finder.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const tags = await this.tagModel
      .find(finder)
      .sort({ sort: 1, createdAt: -1 })
      .exec();

    return tags;
  }

  /**
   * 快速创建标签 (只需要名称)
   */
  async quickCreateTag(data: QuickCreateTagDto, user: string) {
    const tag = await this.tagModel.create({
      name: data.name,
      enable: true,
      sort: 0,
      creator: user,
    });

    return tag;
  }

  /**
   * 创建标签
   */
  async createTag(data: TagDto, user: string) {
    const tag = await this.tagModel.create({
      ...data,
      creator: user,
    });

    // 如果有关联的网站，需要更新网站的标签字段
    if (data.websites && data.websites.length > 0) {
      await this.updateWebsitesTags(data.websites, String(tag._id), 'add');
    }

    return tag;
  }

  /**
   * 更新标签
   */
  async updateTag(id: string, data: UpdateTagDto, user: string) {
    // 获取当前标签信息
    const currentTag = await this.tagModel.findById(id).populate('websites');
    if (!currentTag) {
      throw new Error('标签不存在');
    }

    // 获取当前关联的网站ID列表
    const currentWebsiteIds = currentTag.websites.map((website: any) =>
      website._id.toString(),
    );
    const newWebsiteIds = data.websites || [];

    // 更新标签基本信息
    const updatedTag = await this.tagModel.findByIdAndUpdate(
      id,
      {
        ...data,
        updater: user,
      },
      { new: true },
    );

    // 处理网站关联关系的变化
    const websitesToRemove = currentWebsiteIds.filter(
      (websiteId) => !newWebsiteIds.includes(websiteId),
    );
    const websitesToAdd = newWebsiteIds.filter(
      (websiteId) => !currentWebsiteIds.includes(websiteId),
    );

    // 移除不再关联的网站
    if (websitesToRemove.length > 0) {
      await this.updateWebsitesTags(websitesToRemove, id, 'remove');
    }

    // 添加新关联的网站
    if (websitesToAdd.length > 0) {
      await this.updateWebsitesTags(websitesToAdd, id, 'add');
    }

    return updatedTag;
  }

  /**
   * 删除标签
   */
  async deleteTag(id: string) {
    // 获取标签信息
    const tag = await this.tagModel.findById(id).populate('websites');
    if (!tag) {
      throw new Error('标签不存在');
    }

    // 从所有关联的网站中移除此标签
    const websiteIds = tag.websites.map((website: any) =>
      website._id.toString(),
    );
    if (websiteIds.length > 0) {
      await this.updateWebsitesTags(websiteIds, id, 'remove');
    }

    // 软删除标签
    const result = await this.tagModel.findByIdAndUpdate(id, {
      isDelete: true,
    });

    return result;
  }

  /**
   * 获取标签详情
   */
  async getTagDetail(id: string) {
    const tag = await this.tagModel.findById(id).populate('websites').exec();
    if (!tag) {
      throw new Error('标签不存在');
    }
    return tag;
  }

  /**
   * 批量更新标签状态
   */
  async batchUpdateTagStatus(data: BatchUpdateTagStatusDto) {
    const { ids, enable } = data;

    const result = await this.tagModel.updateMany(
      { _id: { $in: ids } },
      { enable },
    );

    if (result.modifiedCount > 0) {
      return `成功更新 ${result.modifiedCount} 个标签状态`;
    } else {
      throw new Error('更新失败');
    }
  }

  /**
   * 管理标签与网站的关联关系
   */
  async manageTagWebsiteRelation(
    data: TagWebsiteRelationDto,
    action: 'add' | 'remove',
  ) {
    const { tagId, websiteId } = data;

    if (action === 'add') {
      // 添加关联
      await Promise.all([
        this.tagModel.findByIdAndUpdate(tagId, {
          $addToSet: { websites: websiteId },
        }),
        this.websiteModel.findByIdAndUpdate(websiteId, {
          $addToSet: { tags: tagId },
        }),
      ]);
    } else {
      // 移除关联
      await Promise.all([
        this.tagModel.findByIdAndUpdate(tagId, {
          $pull: { websites: websiteId },
        }),
        this.websiteModel.findByIdAndUpdate(websiteId, {
          $pull: { tags: tagId },
        }),
      ]);
    }

    return '关联关系更新成功';
  }

  /**
   * 私有方法：批量更新网站的标签字段
   */
  private async updateWebsitesTags(
    websiteIds: string[],
    tagId: string,
    action: 'add' | 'remove',
  ) {
    const updateOperation =
      action === 'add'
        ? { $addToSet: { tags: tagId } }
        : { $pull: { tags: tagId } };

    await this.websiteModel.updateMany(
      { _id: { $in: websiteIds } },
      updateOperation,
    );

    // 同时更新标签的网站字段
    const tagUpdateOperation =
      action === 'add'
        ? { $addToSet: { websites: { $each: websiteIds } } }
        : { $pull: { websites: { $in: websiteIds } } };

    await this.tagModel.findByIdAndUpdate(tagId, tagUpdateOperation);
  }
}
