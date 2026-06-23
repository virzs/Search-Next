import { TabelRequestParams, TablePageInstance, TablePageOptions, useTablePage } from "@/hooks/useTablePage2";
import { isMobileDevice } from "@/utils/utils";
import {
  ProCard,
  ProColumns,
  ProFieldValueType,
  ProList,
  ProListProps,
  ProTable,
  ProTableProps,
} from "@ant-design/pro-components";
import { Service } from "ahooks/lib/useRequest/src/types";
import { renderEmptyToBarre } from "./utils";
import { ReactNode, useEffect, useState } from "react";
import { css } from "@emotion/css";

export interface TablePageProps<T, U>
  extends Omit<ProTableProps<T, U>, "request">,
    Omit<ProListProps<T, U>, "dataSource" | "footer" | "locale" | "onRow" | "pagination" | "rowClassName" | "size">,
    TablePageOptions<T> {
  service?: Service<T, TabelRequestParams[]>;
  table?: TablePageInstance<T>;
  listFooter?: ProListProps<T, U>["footer"];
  /**
   * 是否显示序号
   */
  order?: boolean;
}

// 添加辅助函数 - 将扁平对象转换为嵌套对象
const convertToNestedObject = (flatObj: Record<string, any>) => {
  const result: Record<string, any> = {};

  Object.entries(flatObj).forEach(([key, value]) => {
    if (key.includes(".")) {
      const keys = key.split(".");
      let current = result;
      keys.forEach((k, index) => {
        if (index === keys.length - 1) {
          current[k] = value;
        } else {
          current[k] = current[k] || {};
          current = current[k];
        }
      });
    } else {
      result[key] = value;
    }
  });

  return result;
};

/**
 * @deprecated 请使用 TablePage2 组件
 */
function TablePage<T extends object = any, U extends object = any>(props: TablePageProps<T, U>) {
  const {
    service,
    table: tableProps,
    children,
    pagination,
    columns = [],
    rowSelection,
    rowKey,
    footer,
    listFooter,
    dataSource,
    size = "small",
    locale,
    rowClassName,
    search,
    order = true,
    ...rest
  } = props;

  const [isMobile, setIsMobile] = useState(isMobileDevice());

  const table =
    tableProps ??
    useTablePage<T>(service ?? (async (): Promise<any> => {}), {
      ...rest,
    });

  const {
    total,
    data = [],
    loading,
    current,
    setCurrent,
    pageSize,
    setPageSize,
    refresh,
    setSelectedRows,
    selectedRowKeys,
    setSelectedRowKeys,
    runAsync,
  } = table;

  const p = {
    loading,
    dataSource: data,
    pagination:
      pagination === false
        ? pagination
        : {
            pageSize,
            total,
            current,
            pageSizeOptions: [200, 1000, 3000, 5000, 10000],
            showSizeChanger: true,
            onChange: (page: number, size: number) => {
              if (size !== pageSize) {
                setCurrent(1);
                setPageSize(size);
                return;
              }
              setCurrent(page);
            },
          },
  };

  const l = (
    <ProList
      className={css`
        .ant-pro-table-list-toolbar {
          &-container {
            padding-top: 0;
          }
        }
        .ant-list {
          min-height: 0;
          .ant-spin-nested-loading {
            height: calc(100% - 44px);
            flex-grow: 1;
            .ant-spin-container {
              height: 100%;
            }
          }
          .ant-list-items {
            overflow-y: auto;
          }
        }
        .ant-list-pagination {
          margin-top: 12px;
          flex-shrink: 0;
        }
      `}
      rowKey="_id"
      rowSelection={{
        columnWidth: 50,
        selectedRowKeys,
        onChange: (keys, rows) => {
          setSelectedRows(rows);
          setSelectedRowKeys(keys);
        },
        ...rowSelection,
      }}
      tableAlertRender={false}
      ghost
      cardProps={{
        ghost: true,
      }}
      footer={listFooter}
      renderItem={(data, index) => {
        // 根据 column 自动处理
        const title = columns[0]?.dataIndex ? (data as any)[columns[0].dataIndex as any] : "";
        const actions = columns.find(
          (i) => i.dataIndex && ["action", "operation"].includes(i.dataIndex?.toString())
        )?.render;

        return (
          <ProCard
            className="mb-2"
            title={title}
            actions={
              actions?.(undefined, data, index, undefined, {
                type: "list",
                dataIndex: columns[0]?.dataIndex,
                title: columns[0]?.title,
              }) as ReactNode
            }
          >
            {columns
              .filter((i) => !["action", "operation", undefined].includes(i.dataIndex?.toString()))
              .slice(1)
              .map((column) => {
                const nowData = (data as any)[column.dataIndex as any];
                return (
                  <div>
                    {column.title}:{" "}
                    {column.render
                      ? column.render(nowData, data, index, undefined, {
                          type: "list",
                          dataIndex: column.dataIndex,
                          title: column.title,
                        })
                      : nowData instanceof Object
                      ? nowData?.name ?? nowData?.title ?? nowData?.label
                      : nowData}
                  </div>
                );
              })}
          </ProCard>
        );
      }}
      {...rest}
      {...p}
    />
  );

  const showSearch = columns.some((i) => i.search);

  const t = (
    <ProTable
      className="rounded-xl overflow-hidden"
      rowClassName={rowClassName}
      locale={locale}
      size={size}
      footer={footer}
      columns={[
        ...(order
          ? ([
              {
                title: "序号",
                dataIndex: "index",
                valueType: "index",
                width: 50,
              },
            ] as ProColumns[])
          : []),
        ...columns.map((i) => ({
          ...i,
          search: i.search ?? false,
          ellipsis: i.ellipsis ?? true,
          renderText: i.renderText
            ? i.renderText
            : i.dataIndex === "creator" || i.dataIndex === "updater"
            ? (text: any) => {
                return text?.username;
              }
            : renderEmptyToBarre,
          ...(i.valueType && ["treeSelect"].includes(i.valueType as ProFieldValueType)
            ? {
                fieldProps: {
                  ...i.fieldProps,
                  labelInValue: true,
                },
              }
            : {}),
        })),
      ]}
      search={
        showSearch && {
          filterType: "light",
          ...search,
        }
      }
      defaultSize="middle"
      options={{
        density: false,
        setting: false,
        reload: () => {
          refresh();
        },
      }}
      virtual
      rowKey="_id"
      rowSelection={{
        columnWidth: 50,
        selectedRowKeys,
        onChange: (keys, rows) => {
          setSelectedRows(rows);
          setSelectedRowKeys(keys);
        },
        ...rowSelection,
      }}
      tableAlertRender={false}
      beforeSearchSubmit={(searchParams) => {
        // 处理 treeSelect 等特殊字段
        // ! ProTable 生成查询表单底层是 BetaSchemaForm，选择器组件回显会只显示value，所以 columns 中强制设置 labelInValue 为 true，提交前处理为 value @ant-design/pro-components@2.8.2
        const processedParams: Record<string, any> = { ...searchParams };

        columns.forEach((column) => {
          const formItemName = column.formItemProps?.name;
          const name = formItemName ?? column.dataIndex;
          const dataIndexes = Array.isArray(name) ? name : [name];

          if (!dataIndexes[0]) return;

          // 将数组路径转换为点号分隔的字符串
          const paramKey = dataIndexes.join(".");
          // 获取原始的搜索值
          const originalKey = dataIndexes[dataIndexes.length - 1];
          const fieldValue = (searchParams as Record<string, any>)[originalKey as string];

          if (fieldValue && column.valueType && ["treeSelect"].includes(column.valueType as ProFieldValueType)) {
            if (Array.isArray(fieldValue)) {
              processedParams[paramKey] = fieldValue.map((item: any) => item.value).join(",");
            } else if (typeof fieldValue === "object") {
              processedParams[paramKey] = fieldValue.value;
            }
          } else if (fieldValue) {
            processedParams[paramKey] = fieldValue;
          }
        });

        // 将扁平对象转换为嵌套对象
        return convertToNestedObject(processedParams);
      }}
      request={async (params) => {
        const { current, pageSize, ...rest } = params;

        return runAsync({ ...rest, page: current, pageSize });
      }}
      {...rest}
      {...p}
    />
  );

  // 监听窗口大小变化，切换表格类型
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(isMobileDevice());
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return isMobile ? l : t;
}

export default TablePage;
