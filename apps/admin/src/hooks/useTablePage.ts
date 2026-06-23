import {
  ITablePageState,
  setCurrent,
  setData,
  setKeyword as setKeywordAction,
  setPageSize,
  setTotal,
  setParams,
  setSelectedRows,
  setSelectedRowKeys,
  setScrollTopIndex,
} from "@/store/table-page";
import { useRequest } from "ahooks";
import {
  Service,
  Options,
  Plugin,
  Result,
} from "ahooks/lib/useRequest/src/types";
import { useEffect, useMemo, useState } from "react";
import { shallowEqual } from "react-redux";
import { useLocation } from "react-router";
import { useAppDispatch, useAppSelector } from "./useApp";

export interface TabelRequestParams {
  page?: number;
  pageSize?: number;
  search?: string;
  [key: string]: any;
}

export interface TableResponse<RecordType> {
  total?: number;
  data?: RecordType[];
}

export interface TablePageOptions<RecordType>
  extends Omit<
    Options<TableResponse<RecordType>, TabelRequestParams[]>,
    "defaultParams"
  > {
  pathname?: string;
  formatData?: (data: RecordType[]) => any[];
  defaultParams?: TabelRequestParams;
  refresh?: boolean;
}

export interface TablePageInstance<RecordType>
  extends Omit<
    Result<TableResponse<RecordType>, TabelRequestParams[]>,
    "data" | "params"
  > {
  current: number;
  setCurrent: (current: number) => void;
  pageSize: number;
  setPageSize: (pageSize: number) => void;
  keyword?: string;
  setKeyword: (keyword: string) => void;
  setKeywordStore: (keyword: string) => void;
  total: number;
  data: RecordType[];
  params: TabelRequestParams;
  selectedRows: RecordType[];
  setSelectedRows: (selectedRows: RecordType[]) => void;
  selectedRowKeys: any[];
  setSelectedRowKeys: (selectedRowKeys: any[]) => void;
  scrollTopIndex: number;
  setScrollTopIndex: (scrollTopIndex: number) => void;
}

export function useTablePage<RecordType = any>(
  service: Service<TableResponse<RecordType>, TabelRequestParams[]>,
  options?: TablePageOptions<RecordType>,
  plugins?: Plugin<TableResponse<RecordType>, TabelRequestParams[]>[]
): TablePageInstance<RecordType> {
  const {
    pathname,
    onSuccess,
    formatData,
    defaultParams,
    refresh: refreshOption,
    ...restOptions
  } = options ?? {};
  const location = useLocation();
  const path = pathname || location.pathname;

  const [keyword, setKeyword] = useState<string>();
  const dispatch = useAppDispatch();
  const rootTableState = useAppSelector<ITablePageState>(
    (state) => state.tablePage,
    shallowEqual
  );
  const state = rootTableState[path] ?? {};
  const {
    current = 1,
    pageSize = 200,
    keyword: keywordStore,
    total: totalStore = 0,
    data: dataStore = [],
    params: paramsStore,
    selectedRows = [],
    selectedRowKeys = [],
    scrollTopIndex = 0,
  } = state;

  const setTotalStore = (value: number) => {
    dispatch(
      setTotal({
        pathname: path,
        value,
      })
    );
  };

  const setDataStore = (value: RecordType[]) => {
    dispatch(
      setData({
        pathname: path,
        value,
      })
    );
  };

  const setParamsStore = (value: TabelRequestParams) => {
    dispatch(
      setParams({
        pathname: path,
        value,
      })
    );
  };

  const setSelectedRowsStore = (value: RecordType[]) => {
    dispatch(
      setSelectedRows({
        pathname: path,
        value,
      })
    );
  };
  const setSelectedRowKeysStore = (value: any[]) => {
    dispatch(
      setSelectedRowKeys({
        pathname: path,
        value,
      })
    );
  };

  const setScrollTopIndexStore = (value: number) => {
    dispatch(
      setScrollTopIndex({
        pathname: path,
        value,
      })
    );
  };

  const getDefaultParams = () => {
    return [
      {
        page: 1,
        pageSize: 200,
        ...defaultParams,
        ...paramsStore,
      },
    ];
  };

  const {
    data: responese,
    params,
    run,
    refresh,
    ...rest
  } = useRequest<TableResponse<RecordType>, TabelRequestParams[]>(
    service,
    {
      cacheKey: path,
      ...(restOptions as Options<
        TableResponse<RecordType>,
        TabelRequestParams[]
      >),
      defaultParams: getDefaultParams(),
      onSuccess: (responese, params) => {
        onSuccess && onSuccess(responese, params);
        if (responese instanceof Array) {
          setTotalStore(responese.length);
          setDataStore(responese);
        } else {
          const { data: data = [], total = 0 } = responese || {};
          setTotalStore(total);
          setDataStore(data);
        }
      },
    },
    plugins
  );

  const mergedParams = useMemo(() => {
    if (params && Array.isArray(params) && params.length) {
      return params[0];
    }
    return {};
  }, [params]);

  useEffect(() => {
    setParamsStore(mergedParams);
  }, [mergedParams]);

  useEffect(() => {
    if (refreshOption) {
      refresh();
    }
  }, [refreshOption]);

  const { data: resultData, total } = responese || {};

  const mergedData: RecordType[] = useMemo(() => {
    if (formatData) {
      return formatData(resultData ?? dataStore);
    }
    return resultData ?? dataStore;
  }, [resultData, dataStore]);

  const setCurrentStore = (value: number) => {
    run({
      ...mergedParams,
      page: value,
    });
    dispatch(
      setCurrent({
        pathname: path,
        value,
      })
    );
  };
  const setPageSizeStore = (value: number) => {
    run({
      ...mergedParams,
      pageSize: value,
    });
    dispatch(
      setPageSize({
        pathname: path,
        value,
      })
    );
  };

  const setKeywordStore = (value: string) => {
    run({
      ...mergedParams,
      search: value,
    });
    dispatch(
      setKeywordAction({
        pathname: path,
        value,
      })
    );
  };

  return {
    ...rest,
    params: mergedParams,
    run,
    refresh,
    total: total ?? totalStore,
    data: mergedData,
    current,
    setCurrent: setCurrentStore,
    pageSize,
    setPageSize: setPageSizeStore,
    keyword: keyword ?? keywordStore,
    setKeyword,
    setKeywordStore,
    selectedRows,
    setSelectedRows: setSelectedRowsStore,
    selectedRowKeys,
    setSelectedRowKeys: setSelectedRowKeysStore,
    scrollTopIndex,
    setScrollTopIndex: setScrollTopIndexStore,
  };
}
