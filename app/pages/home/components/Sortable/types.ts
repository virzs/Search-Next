export interface SortItemBaseConfig {
  share: boolean;
  info: boolean;
  remove: boolean;
}

export interface SortItem<D = any, O = any> {
  id: string | number;
  type: "app" | "group";
  data?: D;
  config?: O;
  children?: SortItem<D, O>[];
}
