import { TabelRequestParams } from "@/hooks/useTablePage2";
import { createSlice } from "@reduxjs/toolkit";

export interface TablePageState {
  current?: number;
  pageSize?: number;
  keyword?: string;
  params?: TabelRequestParams;
  data?: any[];
  total?: number;
  selectedRowKeys?: any[];
  selectedRows?: any[];
  scrollTopIndex?: number;
}

export interface ITablePageState {
  [pathname: string]: TablePageState;
}

const initialState: ITablePageState = {};

export const tablePageSlice = createSlice({
  name: "tablePage",
  initialState,
  reducers: {
    setCurrent: (state, action) => {
      const currentState = state[action.payload.pathname] ?? {};
      return {
        ...state,
        [action.payload.pathname]: {
          ...currentState,
          current: action.payload.value,
        },
      };
    },
    setPageSize: (state, action) => {
      const currentState = state[action.payload.pathname] ?? {};
      return {
        ...state,
        [action.payload.pathname]: {
          ...currentState,
          pageSize: action.payload.value,
        },
      };
    },
    setKeyword: (state, action) => {
      const currentState = state[action.payload.pathname] ?? {};
      return {
        ...state,
        [action.payload.pathname]: {
          ...currentState,
          keyword: action.payload.value,
        },
      };
    },
    setTotal: (state, action) => {
      const currentState = state[action.payload.pathname] ?? {};
      return {
        ...state,
        [action.payload.pathname]: {
          ...currentState,
          total: action.payload.value,
        },
      };
    },
    setData: (state, action) => {
      const currentState = state[action.payload.pathname] ?? {};
      return {
        ...state,
        [action.payload.pathname]: {
          ...currentState,
          data: action.payload.value,
        },
      };
    },
    setSelectedRowKeys: (state, action) => {
      const currentState = state[action.payload.pathname] ?? {};
      return {
        ...state,
        [action.payload.pathname]: {
          ...currentState,
          selectedRowKeys: action.payload.value,
        },
      };
    },
    setSelectedRows: (state, action) => {
      const currentState = state[action.payload.pathname] ?? {};
      return {
        ...state,
        [action.payload.pathname]: {
          ...currentState,
          selectedRows: action.payload.value,
        },
      };
    },
    setParams: (state, action) => {
      const currentState = state[action.payload.pathname] ?? {};
      return {
        ...state,
        [action.payload.pathname]: {
          ...currentState,
          params: action.payload.value,
        },
      };
    },
    setScrollTopIndex: (state, action) => {
      const currentState = state[action.payload.pathname] ?? {};
      return {
        ...state,
        [action.payload.pathname]: {
          ...currentState,
          scrollTopIndex: action.payload.value,
        },
      };
    },
    clearAll: () => {
      return {};
    },
  },
});

export const {
  setCurrent,
  setPageSize,
  setKeyword,
  setTotal,
  setData,
  setSelectedRowKeys,
  setSelectedRows,
  setParams,
  setScrollTopIndex,
  clearAll,
} = tablePageSlice.actions;
