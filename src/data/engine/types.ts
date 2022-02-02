/*
 * @Author: Vir
 * @Date: 2022-01-14 14:30:53
 * @Last Modified by: Vir
 * @Last Modified time: 2022-01-23 17:33:20
 */

export interface SearchEngine {
  _id: string; // id
  name: string; // 搜索引擎名称
  value: string; // 搜索引擎值
  href: string; // 搜索引擎链接
  sugurl?: string; // 搜索引擎热词链接
  description?: string;
  icon: string; // 搜索引擎图标
  isShow: boolean; // 是否显示
  isSelected: boolean; // 是否选中
  count: number; // 使用次数
  classifyId: string; // 分类
  sort: number; // 排序
  userId: string; // 用户id
  isDefault: boolean;
}

export interface SearchEngineClassify {
  _id: string;
  name: string;
  value: string;
  description?: string;
  isShow: boolean;
  isDefault: boolean;
  sort: number;
  userId: string;
}

export type SearchEngineClassifyToApiUse = Omit<
  SearchEngineClassify,
  '_id' | 'userId' | 'sort' | 'isDefault'
>;

export interface SearchEngineClassifyWithChildren extends SearchEngineClassify {
  children: SearchEngine[];
}
