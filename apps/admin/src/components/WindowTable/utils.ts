import { WindowTableColumnType } from ".";
import { CSSProperties } from "react";
import { FixedColumn } from "./hooks/useColumnFixed";

export const WINDOW_TABLE_ROW_HEIGHT = 42;
export const WINDOW_TABLE_SELECTION_COLUMN_WIDTH = 35;
export const WINDOW_TABLE_INDEX_COLUMN_DATA_INDEX = "table-index";
export const TABLE_OPERATION_COLUMN_DATA_INDEX = ["operation", "operate"];

// 树状数据相关工具函数
export interface TreeNode {
  [key: string]: any;
  children?: TreeNode[];
}

export interface FlattenedTreeNode extends TreeNode {
  _level: number; // 层级深度
  _parentKey?: any; // 父节点key
  _hasChildren: boolean; // 是否有子节点
  _isExpanded?: boolean; // 是否展开
}

/**
 * 将树状数据扁平化为一维数组，用于表格渲染
 */
export function flattenTreeData<T extends TreeNode>(
  data: T[],
  expandedKeys: Set<any>,
  rowKey: string = "id",
  childrenColumnName: string = "children",
  level: number = 0,
  parentKey?: any
): FlattenedTreeNode[] {
  const result: FlattenedTreeNode[] = [];

  data.forEach((item) => {
    const key = item[rowKey];
    const children = item[childrenColumnName] as T[] | undefined;
    const hasChildren = Boolean(children && children.length > 0);

    // 添加当前节点
    const flattenedItem: FlattenedTreeNode = {
      ...item,
      _level: level,
      _parentKey: parentKey,
      _hasChildren: hasChildren,
      _isExpanded: expandedKeys.has(key),
    };

    result.push(flattenedItem);

    // 如果有子节点且当前节点已展开，递归处理子节点
    if (hasChildren && expandedKeys.has(key)) {
      const childrenResult = flattenTreeData(children ?? [], expandedKeys, rowKey, childrenColumnName, level + 1, key);
      result.push(...childrenResult);
    }
  });

  return result;
}

/**
 * 检测数据是否为树形结构
 * @param data 数据数组
 * @param childrenColumnName 子节点字段名，默认为 'children'
 * @returns 是否为树形数据
 */
export function isTreeData(data: any[], childrenColumnName: string = "children"): boolean {
  if (!Array.isArray(data) || data.length === 0) {
    return false;
  }

  // 检查是否有任何一条记录包含子节点
  return data.some(
    (item) =>
      item && typeof item === "object" && Array.isArray(item[childrenColumnName]) && item[childrenColumnName].length > 0
  );
}

/**
 * 获取所有可展开的节点keys
 */
export function getAllExpandableKeys<T extends TreeNode>(
  data: T[],
  rowKey: string = "id",
  childrenColumnName: string = "children"
): any[] {
  const keys: any[] = [];

  function traverse(nodes: T[]) {
    nodes.forEach((node) => {
      const children = node[childrenColumnName] as T[] | undefined;
      if (children && children.length > 0) {
        keys.push(node[rowKey]);
        traverse(children);
      }
    });
  }

  traverse(data);
  return keys;
}

type BaseNamePath = string | number | boolean | (string | number | boolean)[];

export type DeepNamePath<Store = any, ParentNamePath extends any[] = []> = ParentNamePath["length"] extends 3
  ? never
  : // Follow code is batch check if `Store` is base type
  true extends (Store extends BaseNamePath ? true : false)
  ? ParentNamePath["length"] extends 0
    ? Store | BaseNamePath // Return `BaseNamePath` instead of array if `ParentNamePath` is empty
    : Store extends any[]
    ? [...ParentNamePath, number] // Connect path
    : never
  : Store extends any[] // Check if `Store` is `any[]`
  ? // Connect path. e.g. { a: { b: string }[] }
    // Get: [a] | [ a,number] | [ a ,number , b]
    [...ParentNamePath, number] | DeepNamePath<Store[number], [...ParentNamePath, number]>
  : keyof Store extends never // unknown
  ? Store
  : {
      // Convert `Store` to <key, value>. We mark key a `FieldKey`
      [FieldKey in keyof Store]: Store[FieldKey] extends Function
        ? never
        :
            | (ParentNamePath["length"] extends 0 ? FieldKey : never) // If `ParentNamePath` is empty, it can use `FieldKey` without array path
            | [...ParentNamePath, FieldKey] // Exist `ParentNamePath`, connect it
            | DeepNamePath<Required<Store>[FieldKey], [...ParentNamePath, FieldKey]>; // If `Store[FieldKey]` is object
    }[keyof Store];

export type SpecialString<T> = T | (string & NonNullable<unknown>);

export type DataIndex<T = any> = DeepNamePath<T> | SpecialString<T> | number | (SpecialString<T> | number)[];

function toArray<T>(arr: T | readonly T[]): T[] {
  if (arr === undefined || arr === null) {
    return [];
  }
  return (Array.isArray(arr) ? arr : [arr]) as T[];
}

export function getPathValue<ValueType, ObjectType extends object>(record: ObjectType, path: DataIndex): ValueType {
  // Skip if path is empty
  if (!path && typeof path !== "number") {
    return record as unknown as ValueType;
  }

  const pathList = toArray(path);

  let current: ValueType | ObjectType = record;

  for (let i = 0; i < pathList.length; i += 1) {
    if (!current) {
      return undefined as unknown as ValueType;
    }

    const prop = pathList[i];
    current = (current as any)[prop];
  }

  return current as ValueType;
}

export function isOperationColumn(dataIndex?: string | string[]): boolean {
  if (typeof dataIndex === "string") {
    const key = dataIndex.toLowerCase();

    for (let i = 0; i < TABLE_OPERATION_COLUMN_DATA_INDEX.length; i++) {
      const index = TABLE_OPERATION_COLUMN_DATA_INDEX[i];
      if (key.includes(index)) {
        return true;
      }
    }
  }

  return false;
}

export function getColumnValue<ValueType = any, RecordType extends object = any>(
  column: WindowTableColumnType<RecordType>,
  rowData: RecordType,
  index: number
): ValueType | undefined | null {
  let text;
  const dataIndex = column.dataIndex;
  if (dataIndex) {
    text = getPathValue<ValueType, RecordType>(rowData, dataIndex);
    if (dataIndex === WINDOW_TABLE_INDEX_COLUMN_DATA_INDEX) {
      if (index || index === 0) {
        text = index + 1;
      }
    }
    if (column.getValue) {
      text = column.getValue(text, rowData, index);
    }
  }

  return text as any;
}

export function getFixedColumnStyle({
  columns = [],
  id,
  color = "#f7f7f7",
}: {
  columns?: FixedColumn[];
  id: string;
  color?: string;
}): { style: CSSProperties; className: string } | null {
  const f = columns?.find((i) => i.id === id);
  const rightFilterArr = columns.filter((i) => i.right !== undefined);
  const leftFilterArr = columns.filter((i) => i.left !== undefined);
  const isFirstRight = rightFilterArr[0]?.id === id;
  const isLastLeft = leftFilterArr[leftFilterArr.length - 1]?.id === id;

  return f
    ? {
        style: {
          left: f.left ?? undefined,
          right: f.right ?? undefined,
          backgroundColor: color,
        },
        className: {
          left: isLastLeft ? "window-table-fixed-left-cell-last" : "window-table-fixed-left-cell",
          right: isFirstRight ? "window-table-fixed-right-cell-first" : "window-table-fixed-right-cell",
        }[f.left ? "left" : "right"],
      }
    : null;
}
