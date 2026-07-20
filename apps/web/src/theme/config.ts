import type { ThemeConfig } from "antd";
import { appControlHeights, appRadii } from "./tokens";
import { createAccentPalette, DEFAULT_THEME_COLOR } from "./color";

export type AppColorScheme = "light" | "dark";

export const createThemeConfig = (
  colorScheme: AppColorScheme,
  themeColor = DEFAULT_THEME_COLOR,
): ThemeConfig => {
  const isDark = colorScheme === "dark";
  const accent = createAccentPalette(themeColor, colorScheme);

  return {
    token: {
      colorPrimary: accent.primary,
      colorPrimaryHover: accent.hover,
      colorPrimaryActive: accent.active,
      colorPrimaryText: accent.text,
      colorTextLightSolid: accent.onAccent,
      borderRadius: appRadii.control,
      borderRadiusXS: appRadii.control,
      borderRadiusSM: appRadii.control,
      borderRadiusLG: appRadii.surface,
      borderRadiusOuter: appRadii.panel,
      colorBgContainer: isDark
        ? "rgba(28, 28, 30, 0.78)"
        : "rgba(255, 255, 255, 0.72)",
      colorBorder: isDark
        ? "rgba(235, 235, 245, 0.16)"
        : "rgba(60, 60, 67, 0.16)",
      colorText: isDark
        ? "rgba(245, 245, 247, 0.92)"
        : "rgba(28, 28, 30, 0.92)",
      colorTextSecondary: isDark
        ? "rgba(235, 235, 245, 0.64)"
        : "rgba(60, 60, 67, 0.62)",
      controlHeight: appControlHeights.default,
      controlHeightSM: appControlHeights.small,
      controlHeightLG: appControlHeights.large,
      controlOutline: accent.alpha(0.14),
    },
    components: {
      Button: {
        defaultShadow: "none",
        primaryShadow: `0 8px 18px ${accent.alpha(0.22)}`,
        borderRadius: appRadii.control,
        borderRadiusSM: appRadii.control,
        borderRadiusLG: appRadii.control,
        paddingInline: 18,
        paddingInlineSM: 12,
        paddingInlineLG: 20,
        fontWeight: 650,
        defaultBg: isDark
          ? "rgba(255, 255, 255, 0.10)"
          : "rgba(255, 255, 255, 0.58)",
        defaultBorderColor: isDark
          ? "rgba(235, 235, 245, 0.14)"
          : "rgba(60, 60, 67, 0.16)",
        defaultColor: isDark
          ? "rgba(245, 245, 247, 0.90)"
          : "rgba(28, 28, 30, 0.88)",
      },
      Menu: {
        itemBg: "transparent",
        activeBarBorderWidth: 0,
        itemMarginInline: 0,
        itemHeight: 36,
        itemBorderRadius: appRadii.control,
      },
      Input: {
        borderRadius: appRadii.control,
        borderRadiusSM: appRadii.control,
        borderRadiusLG: appRadii.control,
        activeBorderColor: accent.primary,
        activeShadow: `0 0 0 3px ${accent.alpha(0.12)}`,
        addonBg: isDark
          ? "rgba(255, 255, 255, 0.10)"
          : "rgba(255, 255, 255, 0.58)",
        hoverBorderColor: accent.alpha(0.42),
      },
      InputNumber: {
        borderRadius: appRadii.control,
        borderRadiusSM: appRadii.control,
        borderRadiusLG: appRadii.control,
        activeBorderColor: accent.primary,
        activeShadow: `0 0 0 3px ${accent.alpha(0.12)}`,
        hoverBorderColor: accent.alpha(0.42),
      },
      Select: {
        borderRadius: appRadii.control,
        borderRadiusSM: appRadii.control,
        borderRadiusLG: appRadii.control,
        optionSelectedBg: accent.alpha(0.1),
        optionSelectedColor: accent.text,
        activeBorderColor: accent.primary,
        activeOutlineColor: accent.alpha(0.12),
        hoverBorderColor: accent.alpha(0.42),
      },
      Switch: {
        colorPrimary: accent.primary,
        colorPrimaryHover: accent.hover,
      },
      Checkbox: {
        borderRadiusSM: appRadii.compact,
      },
      Form: {
        itemMarginBottom: 16,
        labelColor: isDark
          ? "rgba(235, 235, 245, 0.72)"
          : "rgba(36, 37, 40, 0.78)",
        labelFontSize: 12,
      },
      Segmented: {},
    },
  };
};

const theme = createThemeConfig("light");

export default theme;
