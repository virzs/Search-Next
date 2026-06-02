import { useContext } from "react";
import DesktopThemeContext from "@/contexts/DesktopThemeContext";

export const useDesktopTheme = () => {
  const ctx = useContext(DesktopThemeContext);
  if (!ctx) throw new Error("useDesktopTheme must be used within DesktopThemeProvider");
  return ctx;
};

export default useDesktopTheme;

