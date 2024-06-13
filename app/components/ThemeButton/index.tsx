import { motion } from "framer-motion";
import { FC, useEffect, useState } from "react";
import { cx } from "@emotion/css";
import {
  RiComputerFill,
  RiComputerLine,
  RiMoonFill,
  RiMoonLine,
  RiSunFill,
  RiSunLine,
} from "@remixicon/react";

type ThemeType = "system" | "light" | "dark";

interface ThemeOption {
  label: string;
  icon: any;
  selectedIcon: any;
  value: ThemeType;
}

const ThemeButton: FC = () => {
  const [theme, setTheme] = useState<ThemeType>("system");

  const themeVariants = {
    system: { x: "0%" },
    light: { x: "100%" },
    dark: { x: "200%" },
  };

  const iconSize = 18;

  const themeOptions: ThemeOption[] = [
    {
      label: "跟随系统",
      icon: <RiComputerLine size={iconSize} />,
      selectedIcon: <RiComputerFill size={iconSize} />,
      value: "system",
    },
    {
      label: "浅色",
      icon: <RiSunLine size={iconSize} />,
      selectedIcon: <RiSunFill size={iconSize} />,
      value: "light",
    },
    {
      label: "深色",
      icon: <RiMoonLine size={iconSize} />,
      selectedIcon: <RiMoonFill size={iconSize} />,
      value: "dark",
    },
  ];

  const setDocumentTheme = (theme: ThemeType) => {
    const document = window.document.documentElement;
    const documentDataSet = document.dataset;
    documentDataSet.theme = theme;
  };

  const onSystemThemeChange = (e: MediaQueryListEvent) => {
    if (theme === "system") {
      if (e.matches) {
        setDocumentTheme("dark");
      } else {
        setDocumentTheme("light");
      }
    }
  };

  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );

    if (theme !== "system") {
      if (theme === "dark") {
        setDocumentTheme("dark");
      } else {
        setDocumentTheme("light");
      }
    } else {
      if (darkModeMediaQuery.matches) {
        setDocumentTheme("dark");
      } else {
        setDocumentTheme("light");
      }
    }

    darkModeMediaQuery.addEventListener("change", onSystemThemeChange);

    return () => {
      darkModeMediaQuery.removeEventListener("change", onSystemThemeChange);
    };
  }, [theme]);

  return (
    <motion.div className="inline-flex justify-between border dark:border-gray-500 relative rounded-md">
      <motion.div
        className="w-1/3 top-0 left-0 absolute h-full cursor-pointer"
        animate={themeVariants[theme]}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <motion.div className="bg-project-primary dark:bg-gray-200 h-full rounded"></motion.div>
      </motion.div>
      {themeOptions.map((i) => (
        <motion.div
          whileTap={{ scale: 0.9 }}
          className="flex-1 cursor-pointer text-sm text-gray-500 text-center w-8 h-8"
          key={i.value}
          onClick={() => {
            setTheme(i.value);
          }}
        >
          <motion.div
            className={cx(
              "absolute w-8 h-8 flex justify-center items-center transition-all",
              theme === i.value ? "text-gray-200 dark:text-project-primary" : ""
            )}
          >
            {theme === i.value ? i.selectedIcon : i.icon}
          </motion.div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ThemeButton;
