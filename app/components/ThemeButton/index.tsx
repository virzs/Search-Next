import { motion } from "framer-motion";
import { FC, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDisplay, faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import { cx } from "@emotion/css";

type ThemeType = "system" | "light" | "dark";

interface ThemeOption {
  label: string;
  icon: any;
  value: ThemeType;
}

const ThemeButton: FC = () => {
  const [theme, setTheme] = useState<ThemeType>("system");

  const themeVariants = {
    system: { x: "0%" },
    light: { x: "100%" },
    dark: { x: "200%" },
  };

  const themeOptions: ThemeOption[] = [
    {
      label: "跟随系统",
      icon: faDisplay,
      value: "system",
    },
    {
      label: "浅色",
      icon: faSun,
      value: "light",
    },
    {
      label: "深色",
      icon: faMoon,
      value: "dark",
    },
  ];

  useEffect(() => {
    const document = window.document.documentElement;
    const documentDataSet = document.dataset;

    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");

    if (theme === "system") {
      if (systemTheme.matches) {
        documentDataSet.theme = "dark";
      } else {
        documentDataSet.theme = "light";
      }
    } else {
      if (theme === "dark") {
        documentDataSet.theme = "dark";
      } else {
        documentDataSet.theme = "light";
      }
    }
  }, [theme]);

  useEffect(() => {
    // 查看当前系统设置的主题
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";
  }, []);

  return (
    <motion.div className="inline-flex justify-between border dark:border-gray-500 relative rounded-md">
      <motion.div
        className="w-1/3 top-0 left-0 absolute h-full cursor-pointer"
        animate={themeVariants[theme]}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <motion.div className="bg-project-primary dark:bg-white h-full rounded-md"></motion.div>
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
              theme === i.value ? "text-white dark:text-project-primary" : ""
            )}
          >
            <FontAwesomeIcon icon={i.icon} />
          </motion.div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ThemeButton;
