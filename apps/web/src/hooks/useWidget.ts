import { useContext } from "react";
import WidgetContext from "@/contexts/WidgetContext";

export const useWidget = () => {
  const ctx = useContext(WidgetContext);
  if (!ctx) throw new Error("useWidget must be used within WidgetProvider");
  return ctx;
};

export default useWidget;
