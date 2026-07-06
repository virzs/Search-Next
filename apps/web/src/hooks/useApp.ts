import { useContext } from "react";
import AppContext from "@/contexts/AppContext";

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};

export default useApp;
