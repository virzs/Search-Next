import { useEffect, useState } from "react";

export enum Theme {
  Light = "light",
  Dark = "dark",
  Auto = "auto",
}

export const applyTheme = (theme: Theme, setTheme: (theme: Theme) => void) => {
  const isDark = theme === Theme.Dark;
  document.body.classList.toggle("dark", isDark);
  localStorage.setItem("theme", theme);
  setTheme(theme);
};

export const getPrefersColorSchemeMatchMedia = () => {
  return window.matchMedia("(prefers-color-scheme: dark)");
};

export const getSystemTheme = () => {
  return getPrefersColorSchemeMatchMedia().matches ? Theme.Dark : Theme.Light;
};

const useTheme = () => {
  const savedTheme = (localStorage.getItem("theme") as Theme) || Theme.Auto;
  const initialTheme =
    savedTheme === Theme.Auto ? getSystemTheme() : savedTheme;

  const [theme, setTheme] = useState<Theme>(savedTheme);
  const [nowTheme, setNowTheme] = useState<Theme>(initialTheme);

  // 处理主题状态
  useEffect(() => {
    if (theme !== Theme.Auto) {
      setNowTheme(theme);
    } else {
      setNowTheme(getSystemTheme());
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // 应用主题到 DOM
  useEffect(() => {
    document.body.classList.toggle("dark", nowTheme === Theme.Dark);
  }, [nowTheme]);

  // 处理系统主题变化
  useEffect(() => {
    const matchMedia = getPrefersColorSchemeMatchMedia();

    if (theme === Theme.Auto) {
      const handleChange = (e: MediaQueryListEvent) => {
        setNowTheme(e.matches ? Theme.Dark : Theme.Light);
      };

      matchMedia.addEventListener("change", handleChange);
      return () => matchMedia.removeEventListener("change", handleChange);
    }
  }, [theme]);

  return {
    theme: nowTheme,
    realTheme: theme,
    setTheme,
  };
};

export default useTheme;
