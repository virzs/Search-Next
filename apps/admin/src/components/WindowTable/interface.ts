import { TextProps } from "../Text";

export interface WindowTableColumnType<RecordType> extends TextProps {
  className?: string;
  style?: React.CSSProperties;
  dataIndex: string | string[];
  title?: React.ReactNode;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  getValue?: (value: any, record: RecordType, index: number) => any; // 获取实际的值，以用于排序筛选等， 此处 index 为数据中实际的index
  format?: (value: any, record: RecordType, rowIndex: number) => any; // 获取实际用于渲染的值，此处 rowIndex 为渲染时行的 index
  render?: (value: any, record: RecordType, rowIndex: number, children: React.ReactNode) => React.ReactNode;
  filter?: false | "string" | "number" | "date";
  fixed?: "left" | "right";
}

export interface WindowTableRowSelectionProps<RecordType> {
  selectedRowKeys?: any[];
  onChange?: (selectedRowKeys: any[], selectedRows: RecordType[]) => void;
  onDisabled?: (record: RecordType, index: number) => boolean | undefined;
}

export type WindowTableOnRow<RecordType> = (
  record: RecordType,
  index: number
) => {
  onClick?: (event: React.MouseEvent) => void;
  onDisabled?: () => boolean | undefined;
};

export interface WindowTableProps<RecordType> {
  className?: string;
  rowKey?: string;
  columns?: WindowTableColumnType<RecordType>[];
  dataSource?: RecordType[];
  rowHeight?: number;
  loading?: boolean;
  rowSelection?: WindowTableRowSelectionProps<RecordType>;
  onRow?: WindowTableOnRow<RecordType>;
  onScrollTopIndex?: (scrollTopIndex: number) => void;
  initialScrollTopIndex?: number;
  // 树状数据支持
  expandable?: {
    childrenColumnName?: string; // 子数据的字段名，默认为 'children'
    defaultExpandAllRows?: boolean; // 默认展开所有行
    defaultExpandedRowKeys?: any[]; // 默认展开的行keys
    expandedRowKeys?: any[]; // 受控的展开行keys
    onExpand?: (expanded: boolean, record: RecordType) => void; // 展开/折叠回调
    onExpandedRowsChange?: (expandedRowKeys: any[]) => void; // 展开行变化回调
    rowExpandable?: (record: RecordType) => boolean; // 行是否可展开
    indentSize?: number; // 每一层的缩进像素
  };
}
