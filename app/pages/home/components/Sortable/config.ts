export interface SortableItemBaseConfig {
  /** 最大行数 */
  maxRow: number;
  /** 最大列数 */
  maxCol: number;
  /** 允许设置大小 */
  allowResize?: boolean;
  /** 允许打开右键菜单 */
  allowContextMenu?: boolean;
}

// app 类型 config
export const appConfig: SortableItemBaseConfig = {
  maxRow: 2,
  maxCol: 2,
};

export const groupConfig: SortableItemBaseConfig = {
  ...appConfig,
};

export const configMap: {
  [key: string]: SortableItemBaseConfig;
} = {
  app: appConfig,
  group: groupConfig,
};
