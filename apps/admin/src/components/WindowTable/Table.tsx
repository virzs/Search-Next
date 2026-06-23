import { useState, forwardRef, useMemo, useCallback, startTransition } from "react";
import ResizeObserver from "rc-resize-observer";
import {
  getColumnValue,
  isOperationColumn,
  WINDOW_TABLE_INDEX_COLUMN_DATA_INDEX,
  WINDOW_TABLE_ROW_HEIGHT,
  flattenTreeData,
  getAllExpandableKeys,
  FlattenedTreeNode,
  TreeNode,
  isTreeData,
} from "./utils";
import "./style.less";
import { WindowTableProps } from "./interface";
import { Checkbox, Empty, Spin } from "antd";
import { TableVirtuoso } from "react-virtuoso";
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  SortingState,
  ColumnFiltersState,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  filterFns,
  FilterFnOption,
  Row as TableRow,
} from "@tanstack/react-table";
import Row from "./Row";
import Text from "../Text";
import dayjs, { Dayjs } from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { CaretDownOutlined, CaretUpOutlined, CaretRightOutlined } from "@ant-design/icons";
import Filter from "./Filter";
import { getFixedColumnStyle } from "./utils";
import useColumnFixed from "./hooks/useColumnFixed";
import { css, cx } from "@emotion/css";
import { isDateString } from "@/utils/utils";

dayjs.extend(isBetween);

const tableFilters = {
  string: filterFns.arrIncludesSome,
  number: filterFns.inNumberRange,
  date: (row: TableRow<any>, columnId: string, filterValues: Dayjs[]) => {
    const value: any = row.getValue(columnId);

    if (value) {
      const mValue = dayjs(value);
      const start = filterValues[0];
      const end = filterValues[1];

      if (start && end) {
        return mValue.isBetween(start, end, "day", "[]");
      }
      if (start) {
        return mValue.isAfter(start, "day");
      }

      if (end) {
        return mValue.isBefore(end, "day");
      }
    }
    return false;
  },
};

function InternalTable<RecordType extends object = any>(
  props: WindowTableProps<RecordType>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const {
    className,
    rowKey = "_id",
    columns = [],
    dataSource = [],
    loading,
    rowHeight = WINDOW_TABLE_ROW_HEIGHT,
    rowSelection,
    onRow,
    initialScrollTopIndex,
    onScrollTopIndex,
    expandable,
  } = props;

  // 自动检测是否为树形数据
  const isTreeStructure = useMemo(() => {
    return isTreeData(dataSource, expandable?.childrenColumnName || "children");
  }, [dataSource, expandable?.childrenColumnName]);

  // 如果检测到树形数据但没有传入expandable配置，则自动创建默认配置
  const autoExpandable = useMemo(() => {
    if (isTreeStructure && !expandable) {
      return {
        childrenColumnName: "children",
        defaultExpandAllRows: false,
        indentSize: 20,
      };
    }
    return expandable;
  }, [isTreeStructure, expandable]);

  const [tableWidth, setTableWidth] = useState(0);
  const [tableHeight, setTableHeight] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
  const mergedSelectedRowKeys = rowSelection?.selectedRowKeys ?? selectedRowKeys;
  const tableBodyHeight = tableHeight - rowHeight;

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);

  // 树状数据展开状态管理
  const [internalExpandedKeys, setInternalExpandedKeys] = useState<Set<any>>(() => {
    if (!autoExpandable) return new Set();

    const childrenColumnName = autoExpandable.childrenColumnName || "children";

    if (autoExpandable.defaultExpandAllRows) {
      const allKeys = getAllExpandableKeys(dataSource as TreeNode[], rowKey, childrenColumnName);
      return new Set(allKeys);
    }

    if (autoExpandable.defaultExpandedRowKeys) {
      return new Set(autoExpandable.defaultExpandedRowKeys);
    }

    return new Set();
  });

  // 受控的展开状态 - 使用useMemo避免每次渲染都创建新的Set
  const expandedKeys = useMemo(() => {
    return autoExpandable?.expandedRowKeys ? new Set(autoExpandable.expandedRowKeys) : internalExpandedKeys;
  }, [autoExpandable?.expandedRowKeys, internalExpandedKeys]);

  // 处理展开/折叠
  const handleExpand = useCallback(
    (expanded: boolean, record: RecordType) => {
      const key = getColumnValue({ dataIndex: rowKey } as any, record, 0);

      if (autoExpandable?.expandedRowKeys) {
        // 受控模式
        autoExpandable.onExpandedRowsChange?.(
          expanded ? [...autoExpandable.expandedRowKeys, key] : autoExpandable.expandedRowKeys.filter((k) => k !== key)
        );
      } else {
        // 非受控模式
        setInternalExpandedKeys((prev) => {
          const newSet = new Set(prev);
          if (expanded) {
            newSet.add(key);
          } else {
            newSet.delete(key);
          }
          autoExpandable?.onExpandedRowsChange?.(Array.from(newSet));
          return newSet;
        });
      }

      autoExpandable?.onExpand?.(expanded, record);
    },
    [autoExpandable, rowKey]
  );

  // 处理数据源 - 如果是树状数据则扁平化
  const processedDataSource = useMemo(() => {
    if (!autoExpandable || !dataSource.length) {
      return dataSource;
    }

    const childrenColumnName = autoExpandable.childrenColumnName || "children";
    return flattenTreeData(dataSource as TreeNode[], expandedKeys, rowKey, childrenColumnName) as RecordType[];
  }, [
    dataSource,
    Array.from(expandedKeys).sort().join(","),
    autoExpandable?.childrenColumnName,
    autoExpandable?.defaultExpandAllRows,
    autoExpandable?.defaultExpandedRowKeys,
    rowKey,
  ]);

  const columnFilterFns = useMemo(() => {
    let res: {
      [key: string]: FilterFnOption<RecordType>;
    } = {};

    for (let columnIndex = 0; columnIndex < columns.length; columnIndex++) {
      const column = columns[columnIndex];
      const { dataIndex } = column;
      const isIndexColumn = dataIndex === WINDOW_TABLE_INDEX_COLUMN_DATA_INDEX;
      if (!isIndexColumn && !isOperationColumn(dataIndex)) {
        for (let index = 0; index < processedDataSource.length; index++) {
          const record = processedDataSource[index];
          const value = getColumnValue(column, record, index);

          if (value !== undefined && value !== null) {
            if (typeof value === "string") {
              if (isDateString(value)) {
                res[dataIndex.toString()] = tableFilters.date;
                break;
              }
              res[dataIndex.toString()] = tableFilters.string;
              break;
            }
            if (typeof value === "number") {
              res[dataIndex.toString()] = tableFilters.number;
              break;
            }
            break;
          }
        }
      }
    }

    return res;
  }, [columns, processedDataSource]);

  const tableColumns = useMemo(() => {
    return columns.map<ColumnDef<RecordType>>((column) => {
      const { render, dataIndex, ...rest } = column;
      const isIndexColumn = dataIndex === WINDOW_TABLE_INDEX_COLUMN_DATA_INDEX;
      let filterFn: FilterFnOption<RecordType> | undefined = columnFilterFns[dataIndex.toString()];

      if (column.filter) {
        if (typeof column.filter === "string" && Object.keys(tableFilters).includes(column.filter)) {
          filterFn = tableFilters[column.filter];
        }
      }
      let tableColumn: ColumnDef<RecordType> = {
        size: isIndexColumn ? column.width ?? 50 : column.width ?? 120,
        maxSize: isIndexColumn ? column.maxWidth ?? 50 : column.maxWidth,
        minSize: isIndexColumn ? column.minWidth ?? 50 : column.minWidth,
        enableSorting: !isIndexColumn && !isOperationColumn(dataIndex),
        enableResizing: !isIndexColumn && !isOperationColumn(dataIndex),
        enableColumnFilter: !isIndexColumn && !isOperationColumn(dataIndex) && column.filter !== false,
        accessorFn: (row, index) => {
          return getColumnValue(column, row, index);
        },
        id: Array.isArray(dataIndex) ? dataIndex.join(".") : dataIndex,
        header: () => column.title,
        cell: ({ row, getValue, rowIndex }: any) => {
          //console.log("rest", rest.getValue());

          let value: any = getValue();

          // 此处 index 不随筛选而变化，所以使用了 Row 中 flexRender 透传的 rowIndex
          // const rowIndex = row.index;

          // accessorFn 中的 index 为数据的实际 index，不随筛选而变化，此处覆盖为当前行的 rowIndex
          if (column.dataIndex === WINDOW_TABLE_INDEX_COLUMN_DATA_INDEX) {
            value = rowIndex + 1;
          }

          const rowData = row.original;

          // 如果是树状数据且是第一列，添加展开/折叠控件和缩进
          if (autoExpandable && columns.indexOf(column) === 0) {
            const flattenedRow = rowData as FlattenedTreeNode;
            const indentSize = autoExpandable.indentSize || 20;
            const indent = flattenedRow._level * indentSize;

            const expandIcon = flattenedRow._hasChildren ? (
              <span
                className="window-table-cell-tree-expand-icon cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleExpand(!flattenedRow._isExpanded, rowData);
                }}
              >
                {flattenedRow._isExpanded ? <CaretDownOutlined /> : <CaretRightOutlined />}
              </span>
            ) : (
              <span className="window-table-cell-tree-expand-icon window-table-cell-tree-expand-icon-placeholder" />
            );

            const content = column.format ? column.format(value, rowData, rowIndex) : value;
            const textChildren = <Text content={content} {...rest} />;

            // 先通过render函数处理内容
            const renderedContent = render ? render(value, rowData, rowIndex, textChildren) : textChildren;

            // 然后将处理后的内容包装在树形结构中
            const cellContent = (
              <div className="window-table-cell-tree-expand" style={{ paddingLeft: indent }}>
                {expandIcon}
                <div className="window-table-cell-tree-expand-content">{renderedContent}</div>
              </div>
            );

            return cellContent;
          }

          const content = column.format ? column.format(value, rowData, rowIndex) : value;
          const children = <Text content={content} {...rest} />;

          return render ? render(value, rowData, rowIndex, children) : children;
        },
      };
      if (filterFn && column.filter !== false) {
        tableColumn.filterFn = filterFn;
      }
      return tableColumn;
    });
  }, [columns, columnFilterFns]);

  const table = useReactTable({
    columns: tableColumns,
    data: processedDataSource,
    state: {
      sorting,
      columnFilters,
    },
    columnResizeMode: "onChange",

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
  });

  const { fixedColumns, isScrollX } = useColumnFixed<RecordType>({
    columns,
    headers: table.getHeaderGroups(),
  });

  const { rows } = table.getRowModel();

  const disabledRowKeys = useMemo(() => {
    const keys: any[] = [];
    if (processedDataSource.length && onRow) {
      for (let index = 0; index < processedDataSource.length; index++) {
        const record: any = processedDataSource[index];
        const onRowCurrent = onRow(record, index);
        if (!onRowCurrent.onDisabled) {
          return keys;
        }
        const disabled = onRowCurrent.onDisabled();
        if (disabled) {
          keys.push(record[rowKey]);
        }
      }
    }

    return keys;
  }, [processedDataSource, rowKey]);

  const selectionDisabledRowKeys = useMemo(() => {
    const keys: any[] = [];
    if (processedDataSource.length && rowSelection?.onDisabled) {
      for (let index = 0; index < processedDataSource.length; index++) {
        const record: any = processedDataSource[index];

        const disabled = rowSelection.onDisabled(record, index);
        if (disabled) {
          keys.push(record[rowKey]);
        }
      }
    }

    return keys;
  }, [processedDataSource, rowKey]);

  const selectableRowKeys = useMemo(() => {
    const allKeys = processedDataSource.map((item: any) => item[rowKey]);
    if (disabledRowKeys.length || selectionDisabledRowKeys.length) {
      return allKeys.filter((item: any) => !disabledRowKeys.includes(item) && !selectionDisabledRowKeys.includes(item));
    }
    return allKeys;
  }, [disabledRowKeys, selectionDisabledRowKeys]);

  const Table = useCallback((props: any) => <table {...props} className={cx("window-table", className)} />, []);

  const TableHead = useCallback((props: any) => {
    return <thead {...props} className="window-table-header" />;
  }, []);

  const TableBody = useCallback(
    (props: any, ref: any) => {
      if (!rows.length) {
        return (
          <tbody {...props} ref={ref}>
            <tr
              style={{
                height: tableBodyHeight,
                maxHeight: 400,
              }}
            >
              <td colSpan={columns.length}>
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
              </td>
            </tr>
          </tbody>
        );
      }
      return <tbody {...props} ref={ref} />;
    },
    [tableBodyHeight, rows.length]
  );

  const TableRow = useCallback(
    ({ style, ...props }: any) => {
      const disabled = (props.children as any).props.disabled;

      return (
        <tr
          {...props}
          className={cx("window-table-row", {
            "window-table-row-disabled": disabled,
          })}
          style={{
            ...style,
            height: WINDOW_TABLE_ROW_HEIGHT,
          }}
        />
      );
    },
    [WINDOW_TABLE_ROW_HEIGHT]
  );

  // TODO: rangeChanged 提交滚动索引可能在部分环境出现偶发长任务告警。
  // 当前采取 350ms 防抖 + startTransition 低优先级提交以降低影响。
  // 后续可探索：更长防抖、仅在导航/失焦时持久化索引，或改为轻量采样。
  const onRangeChanged = useMemo(() => {
    let timer: any;
    let last = typeof initialScrollTopIndex === "number" ? initialScrollTopIndex : -1;
    return (e: any) => {
      const idx = e.startIndex;
      if (idx === last) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        last = idx;
        if (typeof startTransition === "function") {
          startTransition(() => {
            onScrollTopIndex?.(idx);
          });
        } else {
          onScrollTopIndex?.(idx);
        }
      }, 350);
    };
  }, [onScrollTopIndex, initialScrollTopIndex]);

  const itemContent = useCallback(
    (index: number) => {
      const row = rows[index];
      const record: any = row.original;
      return (
        <Row
          disabled={disabledRowKeys.includes(record[rowKey])}
          selectionDisabled={selectionDisabledRowKeys.includes(record[rowKey])}
          columns={columns}
          rowKey={rowKey}
          rowIndex={index}
          rowData={record}
          cells={row.getVisibleCells()}
          selectedRowKeys={mergedSelectedRowKeys}
          onSelectionChange={(keys) => {
            setSelectedRowKeys(keys);
            rowSelection?.onChange?.(
              keys,
              processedDataSource.filter((item: any) => keys.includes(item[rowKey]))
            );
          }}
          onRow={onRow}
          fixedColumns={fixedColumns}
          isScrollX={isScrollX}
        />
      );
    },
    [rows, columns, disabledRowKeys, selectionDisabledRowKeys, mergedSelectedRowKeys, fixedColumns, isScrollX]
  );

  return (
    <div className="relative w-full h-full" ref={ref}>
      <ResizeObserver
        onResize={({ width, height }) => {
          setTableWidth(width);
          setTableHeight(height);
        }}
      >
        <div className="w-full h-full max-w-full max-h-full overflow-hidden absolute">
          <Spin spinning={loading}>
            <div
              className="relative overflow-auto"
              style={{
                width: tableWidth,
                height: tableHeight,
              }}
            >
              <TableVirtuoso
                className={css`
                  scrollbar-width: thin;
                  scrollbar-color: #eaeaea transparent;
                  scrollbar-gutter: stable;
                `}
                id="window-table-virtuoso"
                computeItemKey={(index) => {
                  const row = rows[index];
                  const record: any = row.original;
                  return record[rowKey];
                }}
                totalCount={rows.length}
                initialTopMostItemIndex={initialScrollTopIndex}
                rangeChanged={onRangeChanged}
                components={{
                  Table,
                  TableHead,
                  TableBody: forwardRef(TableBody),
                  TableRow: TableRow,
                }}
                fixedHeaderContent={() => {
                  return table.getHeaderGroups().map((headerGroup) => (
                    <tr
                      className="window-table-header-row"
                      style={{
                        height: rowHeight,
                      }}
                      key={headerGroup.id}
                    >
                      <td className="window-table-header-cell window-table-selection-column">
                        <Checkbox
                          checked={
                            selectableRowKeys.length > 0 && selectableRowKeys.length === mergedSelectedRowKeys.length
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              const records = [...processedDataSource].filter((item: any) =>
                                selectableRowKeys.includes(item[rowKey])
                              );
                              const keys = selectableRowKeys;
                              setSelectedRowKeys(keys);
                              rowSelection?.onChange?.(keys, records);
                            } else {
                              setSelectedRowKeys([]);
                              rowSelection?.onChange?.([], []);
                            }
                          }}
                        />
                      </td>
                      {headerGroup.headers.map((header) => {
                        const upNode = (
                          <CaretUpOutlined
                            role="presentation"
                            className={cx({
                              "text-[var(--ant-color-primary)]": header.column.getIsSorted() === "asc",
                            })}
                          />
                        );

                        const downNode = (
                          <CaretDownOutlined
                            role="presentation"
                            className={cx({
                              "text-[var(--ant-color-primary)]": header.column.getIsSorted() === "desc",
                            })}
                          />
                        );
                        const isPlaceholder = header.isPlaceholder;

                        const title = isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext());

                        const sorter =
                          header.column.getCanSort() && !isPlaceholder ? (
                            <div
                              className="window-table-header-cell-sorter scale-75"
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              {upNode}
                              {downNode}
                            </div>
                          ) : null;

                        const filter =
                          header.column.getCanFilter() && !isPlaceholder ? (
                            <Filter column={header.column} table={table} filtered={header.column.getIsFiltered()} />
                          ) : null;

                        const resizer =
                          header.column.getCanResize() && !isPlaceholder ? (
                            <div
                              onMouseDown={header.getResizeHandler()}
                              onTouchStart={header.getResizeHandler()}
                              className={cx(
                                "h-4 ml-2 cursor-col-resize transition-colors",
                                header.column.getIsResizing()
                                  ? "bg-[var(--ant-color-primary)]"
                                  : "bg-[var(--ant-table-header-split-color)]"
                              )}
                              style={{
                                width: 2,
                              }}
                            />
                          ) : null;
                        const fixed = getFixedColumnStyle({
                          columns: fixedColumns,
                          id: header.id,
                        });
                        return (
                          <th
                            className={cx("window-table-header-cell", {
                              [fixed?.className ?? ""]: isScrollX,
                            })}
                            key={header.id}
                            colSpan={header.colSpan}
                            style={{
                              width: header.getSize(),
                              maxWidth: header.column.columnDef.maxSize,
                              minWidth: header.column.columnDef.minSize,
                              ...(isScrollX ? fixed?.style : {}),
                            }}
                          >
                            <div
                              className={cx("window-table-header-cell-content", {
                                "cursor-pointer": header.column.getCanSort(),
                              })}
                            >
                              <div
                                className="window-table-header-cell-title"
                                onClick={header.column.getToggleSortingHandler()}
                              >
                                {title}
                              </div>
                              {sorter}
                              {filter}
                              {resizer}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  ));
                }}
                itemContent={itemContent}
              />
            </div>
          </Spin>
        </div>
      </ResizeObserver>
    </div>
  );
}

const ForwardWindowTable = forwardRef(InternalTable) as <RecordType extends object = any>(
  props: React.PropsWithChildren<WindowTableProps<RecordType>> & {
    ref?: React.Ref<HTMLDivElement>;
  }
) => React.ReactElement;

type InternalWindowTableType = typeof ForwardWindowTable;

interface WindowTableInterface extends InternalWindowTableType {}

const WindowTable = ForwardWindowTable as WindowTableInterface;

export default WindowTable;
