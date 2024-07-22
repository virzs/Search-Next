export interface SortableItemBaseConfig {
  /** 最大行数 */
  maxRow: number;
  /** 最大列数 */
  maxCol: number;
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
