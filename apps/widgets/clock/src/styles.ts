import type { CSSProperties } from "react";

export const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");

type ClockCssVars = CSSProperties & Record<`--clock-${string}`, string>;

const lightTheme: ClockCssVars = {
  "--clock-page": "#f2f2f7",
  "--clock-app": "#f7f7fb",
  "--clock-sidebar": "#ffffff",
  "--clock-card": "#ffffff",
  "--clock-card-soft": "#f1f2f7",
  "--clock-card-bg": "linear-gradient(180deg, #ffffff 0%, #f2f3f8 100%)",
  "--clock-card-highlight": "linear-gradient(135deg, rgba(255, 255, 255, 0.9), transparent 44%)",
  "--clock-face": "#fbfbfd",
  "--clock-fg": "#1d1d1f",
  "--clock-fg-2": "#62626a",
  "--clock-fg-3": "#8e8e97",
  "--clock-accent": "#ff9f0a",
  "--clock-cyan": "#00a7d8",
  "--clock-green": "#2db84d",
  "--clock-red": "#ff453a",
  "--clock-border": "rgba(0, 0, 0, 0.08)",
  "--clock-divider": "rgba(0, 0, 0, 0.07)",
  "--clock-shadow": "0 14px 32px rgba(22, 26, 33, 0.12)",
  "--clock-track": "rgba(0, 0, 0, 0.1)",
  "--clock-tick": "rgba(20, 20, 24, 0.32)",
  "--clock-tick-major": "rgba(20, 20, 24, 0.68)",
  "--clock-overlay": "rgba(0, 0, 0, 0.045)",
  "--clock-elevated": "rgba(0, 0, 0, 0.055)",
  "--clock-active-fg": "#171719",
  "--clock-calendar-bg": "#ffffff",
  "--clock-calendar-fg": "#111113",
};

const darkTheme: ClockCssVars = {
  "--clock-page": "#000000",
  "--clock-app": "#000000",
  "--clock-sidebar": "#111113",
  "--clock-card": "#171719",
  "--clock-card-soft": "#242426",
  "--clock-card-bg": "linear-gradient(180deg, #202023 0%, #080809 100%)",
  "--clock-card-highlight": "linear-gradient(135deg, rgba(255, 255, 255, 0.1), transparent 38%)",
  "--clock-face": "#09090a",
  "--clock-fg": "#f5f5f7",
  "--clock-fg-2": "#b7b7bd",
  "--clock-fg-3": "#74747c",
  "--clock-accent": "#ff9f0a",
  "--clock-cyan": "#64d2ff",
  "--clock-green": "#32d74b",
  "--clock-red": "#ff453a",
  "--clock-border": "rgba(255, 255, 255, 0.1)",
  "--clock-divider": "rgba(255, 255, 255, 0.08)",
  "--clock-shadow": "0 20px 48px rgba(0, 0, 0, 0.48)",
  "--clock-track": "rgba(255, 255, 255, 0.12)",
  "--clock-tick": "rgba(255, 255, 255, 0.3)",
  "--clock-tick-major": "rgba(255, 255, 255, 0.68)",
  "--clock-overlay": "rgba(255, 255, 255, 0.06)",
  "--clock-elevated": "rgba(255, 255, 255, 0.06)",
  "--clock-active-fg": "#171719",
  "--clock-calendar-bg": "#f5f5f7",
  "--clock-calendar-fg": "#111113",
};

export const clockThemeVars: Record<"light" | "dark", ClockCssVars> = {
  light: lightTheme,
  dark: darkTheme,
};
