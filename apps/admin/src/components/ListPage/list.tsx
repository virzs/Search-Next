import {
  TabelRequestParams,
  TablePageInstance,
  TablePageOptions,
  useTablePage,
} from "@/hooks/useTablePage2";
import { ProList, ProListProps } from "@ant-design/pro-components";
import { Service } from "ahooks/lib/useRequest/src/types";

export interface ListPageProps<RecordType>
  extends ProListProps,
    TablePageOptions<RecordType> {
  service?: Service<RecordType, TabelRequestParams[]>;
  table?: TablePageInstance<RecordType>;
}

function PageList<RecordType extends object = any>(
  props: ListPageProps<RecordType>
) {
  const {
    service,
    table: tableProps,
    children,
    pagination,
    columns = [],
    rowSelection,
    rowKey,
    ...rest
  } = props;

  const table =
    tableProps ??
    useTablePage<RecordType>(service ?? (async (): Promise<any> => {}), {
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
  } = table;

  return (
    <ProList<RecordType>
      pagination={{
        pageSize,
        total,
        current,
        pageSizeOptions: [200, 1000, 3000, 5000, 10000],
        showSizeChanger: true,
        onChange: (page, size) => {
          if (size !== pageSize) {
            setCurrent(1);
            setPageSize(size);
            return;
          }
          setCurrent(page);
        },
      }}
      dataSource={data}
      loading={loading}
      virtual
      {...rest}
    ></ProList>
  );
}

export default PageList;
