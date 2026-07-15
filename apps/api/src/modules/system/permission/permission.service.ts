import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Permission } from 'src/schemas/permission';
import { Model } from 'mongoose';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { TreeDto } from './dto/tree.dto';

type PermissionTreeNode = Record<string, any> & {
  _id: any;
  parent?: any;
  children?: PermissionTreeNode[] | null;
  level?: number;
  createdAt?: Date;
};

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getIdString = (value: any): string | null => {
  if (!value) {
    return null;
  }

  if (typeof value === 'object' && value._id) {
    return value._id.toString();
  }

  return value.toString();
};

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
    const keyword = (params?.name || params?.search || '').trim();
    const isSimple = params?.simple === true || `${params?.simple}` === 'true';
    const activeOnly =
      params?.activeOnly === true || `${params?.activeOnly}` === 'true';
    const projection = isSimple
      ? '_id name parent type source isStale createdAt updatedAt'
      : '-__v -isDelete';
    const docs = (await this.permissionModel
      .find(activeOnly ? { isStale: { $ne: true } } : {})
      .select(projection)
      .sort({ createdAt: 1 })
      .lean()
      .exec()) as PermissionTreeNode[];

    const nodes = docs.map((doc) => ({ ...doc }));
    const nodeMap = new Map(nodes.map((node) => [getIdString(node._id), node]));
    const visibleIds = new Set<string>();

    if (keyword) {
      const matcher = new RegExp(escapeRegExp(keyword), 'i');
      const childIdsByParent = new Map<string, string[]>();

      for (const node of nodes) {
        const nodeId = getIdString(node._id);
        const parentKey = getIdString(node.parent);

        if (!nodeId || !parentKey) {
          continue;
        }

        const childIds = childIdsByParent.get(parentKey) ?? [];
        childIds.push(nodeId);
        childIdsByParent.set(parentKey, childIds);
      }

      const addAncestors = (node: PermissionTreeNode) => {
        let current: PermissionTreeNode | undefined = node;
        while (current) {
          const currentId = getIdString(current._id);
          if (!currentId || visibleIds.has(currentId)) {
            break;
          }
          visibleIds.add(currentId);
          current = nodeMap.get(getIdString(current.parent));
        }
      };

      const addDescendants = (node: PermissionTreeNode) => {
        const nodeId = getIdString(node._id);
        if (!nodeId) {
          return;
        }
        visibleIds.add(nodeId);
        for (const childId of childIdsByParent.get(nodeId) ?? []) {
          const child = nodeMap.get(childId);
          if (child) {
            addDescendants(child);
          }
        }
      };

      for (const node of nodes) {
        if (matcher.test(node.name ?? '')) {
          addAncestors(node);
          addDescendants(node);
        }
      }
    } else {
      for (const node of nodes) {
        const nodeId = getIdString(node._id);
        if (nodeId) {
          visibleIds.add(nodeId);
        }
      }
    }

    const childrenByParent = new Map<string, PermissionTreeNode[]>();
    const rootNodes: PermissionTreeNode[] = [];

    for (const node of nodes) {
      const nodeId = getIdString(node._id);
      if (!nodeId || !visibleIds.has(nodeId)) {
        continue;
      }

      node.children = null;
      const parentKey = getIdString(node.parent);
      if (parentKey && visibleIds.has(parentKey)) {
        const children = childrenByParent.get(parentKey) ?? [];
        children.push(node);
        childrenByParent.set(parentKey, children);
      } else {
        rootNodes.push(node);
      }
    }

    const sortNodes = (items: PermissionTreeNode[]) => {
      items.sort((a, b) => {
        const aHasChildren = Boolean(a.children?.length);
        const bHasChildren = Boolean(b.children?.length);

        if (aHasChildren !== bHasChildren) {
          return aHasChildren ? -1 : 1;
        }

        return (
          new Date(a.createdAt ?? 0).getTime() -
          new Date(b.createdAt ?? 0).getTime()
        );
      });
    };

    const attachChildren = (node: PermissionTreeNode, currentLevel: number) => {
      node.level = currentLevel;
      const nodeId = getIdString(node._id);
      const children = nodeId ? childrenByParent.get(nodeId) : undefined;
      if (!children?.length) {
        node.children = null;
        return;
      }

      node.children = children;
      for (const child of children) {
        attachChildren(child, currentLevel + 1);
      }
      sortNodes(children);
    };

    for (const root of rootNodes) {
      attachChildren(root, level);
    }
    sortNodes(rootNodes);

    if (parentId) {
      return childrenByParent.get(getIdString(parentId)) ?? [];
    }

    return rootNodes;
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
