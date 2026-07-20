import type { ThemeConfig } from "antd";
import { appControlHeights, appRadii } from "./tokens";

const primaryColor = "rgb(250, 84, 28)";
const primaryColorHover = "rgb(255, 104, 50)";
const primaryColorActive = "rgb(224, 68, 18)";

export type AppColorScheme = "light" | "dark";

export const createThemeConfig = (colorScheme: AppColorScheme): ThemeConfig => {
  const isDark = colorScheme === "dark";

  return {
    token: {
      colorPrimary: primaryColor,
      colorPrimaryHover: primaryColorHover,
      colorPrimaryActive: primaryColorActive,
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
      controlOutline: "rgba(250, 84, 28, 0.14)",
    },
    components: {
      Button: {
        defaultShadow: "none",
        primaryShadow: "0 8px 18px rgba(250, 84, 28, 0.22)",
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
        activeBorderColor: primaryColor,
        activeShadow: "0 0 0 3px rgba(250, 84, 28, 0.12)",
        addonBg: isDark
          ? "rgba(255, 255, 255, 0.10)"
          : "rgba(255, 255, 255, 0.58)",
        hoverBorderColor: "rgba(250, 84, 28, 0.42)",
      },
      InputNumber: {
        borderRadius: appRadii.control,
        borderRadiusSM: appRadii.control,
        borderRadiusLG: appRadii.control,
        activeBorderColor: primaryColor,
        activeShadow: "0 0 0 3px rgba(250, 84, 28, 0.12)",
        hoverBorderColor: "rgba(250, 84, 28, 0.42)",
      },
      Select: {
        borderRadius: appRadii.control,
        borderRadiusSM: appRadii.control,
        borderRadiusLG: appRadii.control,
        optionSelectedBg: "rgba(250, 84, 28, 0.1)",
        optionSelectedColor: isDark
          ? "rgb(255, 214, 199)"
          : "rgb(154, 52, 18)",
        activeBorderColor: primaryColor,
        activeOutlineColor: "rgba(250, 84, 28, 0.12)",
        hoverBorderColor: "rgba(250, 84, 28, 0.42)",
      },
      Switch: {
        colorPrimary: primaryColor,
        colorPrimaryHover: primaryColorHover,
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
