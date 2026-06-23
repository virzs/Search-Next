import React, { forwardRef } from "react";
import { Button, Dropdown, Input, Pagination, PaginationProps, Space, Table, Tooltip } from "antd";
import WindowTable, { WindowTableProps } from "../WindowTable";
import { EllipsisOutlined, ReloadOutlined } from "@ant-design/icons";
import { TabelRequestParams, TablePageInstance, TablePageOptions, useTablePage } from "@/hooks/useTablePage2";
import { Service } from "ahooks/lib/useRequest/src/types";
import "./style.less";
import { ProCard, ProCardProps } from "@ant-design/pro-components";
import { useLayout } from "@/context";
import { cx } from "@emotion/css";

export interface TablePageProps<RecordType> extends WindowTableProps<RecordType>, TablePageOptions<RecordType> {
  service?: Service<RecordType, TabelRequestParams[]>;
  table?: TablePageInstance<RecordType>;
  showSearch?: boolean;
  button?: React.ReactNode;
  pagination?: PaginationProps | false;
  searchPlaceholder?: string;
  children?: React.ReactNode;
  cardProps?: ProCardProps;
}

function InternalTablePage<RecordType extends object = any>(
  props: TablePageProps<RecordType>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const {
    pathname,
    service,
    table: tableProps,
    defaultParams,
    cardProps,
    showSearch = false,
    searchPlaceholder,
    button,
    children,
    pagination,
    columns = [],
    rowSelection,
    onScrollTopIndex,
    ...rest
  } = props;

  const { appId } = useLayout();

  const table =
    tableProps ??
    useTablePage<RecordType>(service ?? (async (): Promise<any> => {}), {
      defaultParams,
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
    keyword,
    setKeyword,
    setKeywordStore,
    refresh,
    setSelectedRows,
    selectedRowKeys,
    setSelectedRowKeys,
    scrollTopIndex,
    setScrollTopIndex,
  } = table;

  return (
    <ProCard
      className="w-full h-full"
      bodyStyle={{ padding: 0, display: "flex", flexDirection: "column" }}
      {...cardProps}
    >
      <div className="flex items-center pt-5 pb-4 px-6">
        <div className="flex flex-1 items-center">
          <Space>
            <div className="hidden lg:flex lg:gap-2">{button}</div>
            {button ? (
              <div className="block lg:hidden">
                <Dropdown overlay={<div className="w-30 flex flex-col gap-2 bg-white p-4 shadow">{button}</div>}>
                  <EllipsisOutlined />
                </Dropdown>
              </div>
            ) : null}
          </Space>
          {children}
        </div>
        <Space>
          {showSearch && (
            <Input.Search
              className="table-page-search w-32 md:w-36 lg:w-40 xl:w-56"
              placeholder={searchPlaceholder || "搜索"}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onSearch={(value) => {
                setKeywordStore(value);
              }}
            />
          )}
          <Tooltip title={"刷新"}>
            <Button icon={<ReloadOutlined />} type="text" loading={loading} onClick={() => refresh()}></Button>
          </Tooltip>
        </Space>
      </div>
      {/* 这里设置了一个隐藏的Table组件是因为WindowTable要使用ant-table-css-var定义的主题变量，不添加Table组件这些变量不会生成，暂时没找到替代的方法 */}
      <Table className="hidden" />
      <div className={cx(appId, "ant-table-css-var flex-1 px-6")}>
        <WindowTable
          dataSource={data}
          loading={loading}
          initialScrollTopIndex={scrollTopIndex}
          onScrollTopIndex={(value) => {
            setScrollTopIndex(value);
            onScrollTopIndex?.(value);
          }}
          {...rest}
          ref={ref}
          columns={columns}
          rowSelection={{
            ...rowSelection,
            selectedRowKeys,
            onChange: (keys, records) => {
              setSelectedRowKeys(keys);
              setSelectedRows(records);
              rowSelection?.onChange?.(keys, records);
            },
          }}
        ></WindowTable>
      </div>
      {pagination !== false && (
        <div className="flex justify-end px-6 pb-5 pt-3">
          <Pagination
            total={total}
            showSizeChanger
            current={current}
            pageSize={pageSize}
            pageSizeOptions={[200, 1000, 3000, 5000, 10000]}
            onChange={(page, size) => {
              if (size !== pageSize) {
                setCurrent(1);
                setPageSize(size);
                return;
              }
              setCurrent(page);
            }}
            {...pagination}
          />
        </div>
      )}
    </ProCard>
  );
}

const ForwardTablePage = forwardRef(InternalTablePage) as <RecordType extends object = any>(
  props: React.PropsWithChildren<TablePageProps<RecordType>> & {
    ref?: React.Ref<HTMLDivElement>;
  }
) => React.ReactElement;

type InternalTablePageType = typeof ForwardTablePage;

interface TablePageInterface extends InternalTablePageType {}

const TablePage = ForwardTablePage as TablePageInterface;

export default TablePage;
