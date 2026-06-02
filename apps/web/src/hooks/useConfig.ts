import { useContext } from "react";
import ConfigContext from "@/contexts/ConfigContext";

export const useConfig = () => {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error("useConfig must be used within AppConfigProvider");
  return ctx;
};

export default useConfig;