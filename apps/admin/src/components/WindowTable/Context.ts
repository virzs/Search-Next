import { createContext } from "react";
import { WindowTableColumnType } from "./interface";

export interface WindowTableContextProps {
  rowKey: string;
  columns: WindowTableColumnType<any>[];
}
export const WindowTableContext = createContext<WindowTableContextProps>({
  rowKey: "id",
  columns: [],
});

export const WindowTableProvider = WindowTableContext.Provider;
