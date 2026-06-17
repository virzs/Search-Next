import { createContext, type ReactNode } from "react";

export interface AppRoutedHeaderContextValue {
  hasHistoryControls: boolean;
  setHeader: (id: symbol, header: ReactNode | null) => void;
}

export const AppRoutedHeaderContext =
  createContext<AppRoutedHeaderContextValue | null>(null);

export const AppRoutedPageActiveContext = createContext(true);
