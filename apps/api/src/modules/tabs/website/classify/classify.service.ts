import { Inject, Injectable } from '@nestjs/common';
import { WebsiteClassifyName, WebsiteName } from '../schemas/ref-names';
import { WebsiteClassify } from '../schemas/classify';
import { Cache } from 'cache-manager';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cron } from '@nestjs/schedule';
import { WebsiteClassifyDto } from '../dto/classify';
import { Website } from '../schemas/website';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class ClassifyService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectModel(WebsiteClassifyName)
    private classifyModel: Model<WebsiteClassify>,
    @InjectModel(WebsiteName) private websiteModel: Model<Website>,
  ) {}

  async createClassify(data: WebsiteClassifyDto, user: string) {
    if (data.parent) {
      const parent = await this.classifyModel.findById(data.parent);
      if (!parent || parent.isDelete) {
        throw new Error('父分类不存在');
      }

      // 检查当前分类层级，最多允许2层（根分类为第0层）
      if (parent.parent) {
        // 如果父分类已经有父分类，说明父分类是第1层
        // 当前分类将是第2层，再创建子分类将超过2层限制
        throw new Error('分类最多只能创建2层');
      }
    }
    const result = await this.classifyModel.create({
      ...data,
      creator: user,
      isDelete: false, // 确保新创建的分类isDelete字段为false
    });

    // 创建后更新缓存的分类树
    await this.cacheTree();

    return result;
  }

  async updateClassify(id: string, data: WebsiteClassifyDto, user: string) {
    // 检查当前分类是否存在且未被删除
    const currentClassify = await this.classifyModel.findById(id);
    if (!currentClassify || currentClassify.isDelete) {
      throw new Error('分类不存在或已被删除');
    }

    // 如果要更新父分类，需要检查是否会超过层级限制
    if (data.parent) {
      const parent = await this.classifyModel.findById(data.parent);
      if (!parent || parent.isDelete) {
        throw new Error('父分类不存在或已被删除');
      }

      // 检查更新后是否会超过2层限制
      if (parent.parent) {
        // 如果父分类已经有父分类，说明父分类是第1层
        // 当前分类将是第2层，无法设置为其他分类的父分类
        throw new Error('分类最多只能创建2层');
      }

      // 检查当前分类是否有子分类
      const hasChildren = await this.classifyModel.exists({
        parent: id,
        isDelete: { $ne: true }, // 只检查未删除的子分类
      });
      if (hasChildren) {
        // 如果当前分类有子分类，且尝试将其设为第2层分类，会导致子分类成为第3层
        throw new Error('当前分类已有子分类，无法设置为第2层分类');
      }
    }

    const result = await this.classifyModel.findByIdAndUpdate(id, {
      ...data,
      updater: user,
    });

    // 更新后刷新缓存的分类树
    await this.cacheTree();

    return result;
  }

  async deleteClassify(id: string) {
    // 查找未被删除的子分类
    const children = await this.classifyModel.find({
      parent: id,
      isDelete: { $ne: true },
    });
    if (children.length > 0) {
      // 递归删掉子分类
      for (let i = 0; i < children.length; i++) {
        await this.deleteClassify(String(children[i]._id));
      }
    }
    const result = await this.classifyModel.findByIdAndUpdate(id, {
      isDelete: true,
    });

    // 如果分类删除 取消对应的关联
    await this.websiteModel.updateMany(
      { classify: id },
      { $set: { classify: null } },
    );

    // 删除后更新缓存的分类树
    await this.cacheTree();

    return result;
  }

  async toggleWebsite(classifyId: string, websiteId: string) {
    const classify = await this.classifyModel.findById(classifyId);
    if (!classify || classify.isDelete) {
      throw new Error('分类未找到或已被删除');
    }

    // 先检查网站是否已经在该分类中
    const isWebsiteInClassify = classify.websites.some(
      (id) => id.toString() === websiteId,
    );

    // 如果网站已经在该分类中，则移除；如果不在，则添加
    const updateOperation = isWebsiteInClassify
      ? { $pull: { websites: websiteId } }
      : { $addToSet: { websites: websiteId } };

    await this.classifyModel.findByIdAndUpdate(classifyId, updateOperation);

    // 更新网站的分类信息
    // 如果是添加操作，将该分类设为网站的分类
    if (!isWebsiteInClassify) {
      await this.websiteModel.findByIdAndUpdate(websiteId, {
        classify: classifyId,
      });
    }
    // 如果是移除操作，清除网站的分类（仅当网站的当前分类是这个分类时）
    else {
      const website = await this.websiteModel.findById(websiteId);
      if (
        website &&
        website.classify &&
        website.classify.toString() === classifyId
      ) {
        await this.websiteModel.findByIdAndUpdate(websiteId, {
          classify: null,
        });
      }
    }

    // 更新网站关联后更新缓存的分类树
    await this.cacheTree();
  }

  async getTree(
    params?: {
      name?: string;
      populate?: string;
    },
    parentId = null,
  ) {
    let result = [];
    const { populate } = params;
    // 添加过滤条件，排除已删除的分类
    const query = {
      parent: parentId,
      name: new RegExp(params?.name ?? '', 'i'),
      isDelete: { $ne: true }, // 排除isDelete为true的记录
    };

    if (populate) {
      result = await this.classifyModel
        .find(query)
        .populate({
          path: populate,
          options: {
            limit: 9,
            sort: { click: -1 },
          },
        })
        .exec();
    } else {
      result = await this.classifyModel.find(query).exec();
    }
    for (let i = 0; i < result.length; i++) {
      const children = await this.getTree(params, result[i]._id);
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

  async getSelfAndChildrenIds(classifyId: string) {
    const children = await this.classifyModel
      .find({
        parent: classifyId,
        isDelete: { $ne: true },
        enable: true,
      })
      .select('_id')
      .exec();

    return [classifyId, ...children.map((c: any) => c._id.toString())];
  }

  async getPublicLevel1Classifies() {
    const roots = await this.classifyModel
      .find({
        parent: null,
        isDelete: { $ne: true },
        enable: true,
      })
      .select('_id name description icon sort')
      .sort({ sort: -1, createdAt: 1 })
      .exec();

    if (roots.length === 0) return [];

    const rootIds = roots.map((r: any) => r._id);
    const children = await this.classifyModel
      .find({
        parent: { $in: rootIds },
        isDelete: { $ne: true },
        enable: true,
      })
      .select('_id parent')
      .exec();

    const childrenByParent = new Map<string, string[]>();
    for (const child of children as any[]) {
      const parentId = child.parent?.toString?.() ?? String(child.parent);
      if (!childrenByParent.has(parentId)) childrenByParent.set(parentId, []);
      childrenByParent.get(parentId)!.push(child._id.toString());
    }

    const relevantClassifyIds = [
      ...roots.map((r: any) => r._id),
      ...children.map((c: any) => c._id),
    ].map((id: any) => new Types.ObjectId(id));

    const counts = await this.websiteModel
      .aggregate([
        {
          $match: {
            enable: true,
            public: true,
            classify: { $in: relevantClassifyIds },
          },
        },
        { $group: { _id: '$classify', count: { $sum: 1 } } },
      ])
      .exec();

    const countByClassify = new Map<string, number>();
    for (const row of counts as any[]) {
      countByClassify.set(String(row._id), Number(row.count ?? 0));
    }

    const result: any[] = [];
    for (const root of roots as any[]) {
      const rootId = root._id.toString();
      const childIds = childrenByParent.get(rootId) ?? [];
      const total =
        (countByClassify.get(rootId) ?? 0) +
        childIds.reduce((sum, id) => sum + (countByClassify.get(id) ?? 0), 0);
      if (total <= 0) continue;
      result.push({ ...root.toObject(), websiteCount: total });
    }

    return result;
  }

  /**
   * 获取详情
   */
  async detail(id: string) {
    return await this.classifyModel.findOne(
      { _id: id, isDelete: { $ne: true } },
      { websites: 0 },
    );
  }

  /**
   * 获取分类树
   */
  async treeInfo(query: any) {
    return await this.getTree(query);
  }

  /**
   * 缓存分类树
   */
  async cacheTree() {
    // 缓存这里默认获取每个分类下前9个网站
    const tree = await this.getTree({
      populate: 'websites',
    });
    await this.cacheManager.set(
      'website_classify_tree',
      tree,
      2 * 60 * 60 * 1000,
    );
    return tree;
  }

  /**
   * 每小时更新一次分类树
   */
  @Cron('0 0 * * * *')
  async updateClassifyTree() {
    await this.cacheTree();
  }

  /**
   * 从缓存中获取分类树，没有则重新获取并缓存
   */
  async getClassifyTree() {
    const tree = null; // await this.cacheManager.get('website_classify_tree');
    if (!tree) {
      return await this.cacheTree();
    }
    return tree;
  }
}
