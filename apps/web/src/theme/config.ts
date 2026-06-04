import type { ThemeConfig } from "antd";

const primaryColor = "rgb(250, 84, 28)";
const primaryColorHover = "rgb(255, 104, 50)";
const primaryColorActive = "rgb(224, 68, 18)";

const theme: ThemeConfig = {
  token: {
    colorPrimary: primaryColor,
    colorPrimaryHover: primaryColorHover,
    colorPrimaryActive: primaryColorActive,
    borderRadius: 12,
    colorBgContainer: "rgba(255, 255, 255, 0.72)",
    colorBorder: "rgba(60, 60, 67, 0.16)",
    colorText: "rgba(28, 28, 30, 0.92)",
    colorTextSecondary: "rgba(60, 60, 67, 0.62)",
    controlHeight: 36,
    controlOutline: "rgba(250, 84, 28, 0.14)",
  },
  components: {
    Button: {
      defaultShadow: "none",
      primaryShadow: "0 8px 18px rgba(250, 84, 28, 0.22)",
      borderRadius: 999,
      paddingInline: 18,
      defaultBg: "rgba(255, 255, 255, 0.58)",
      defaultBorderColor: "rgba(60, 60, 67, 0.16)",
      defaultColor: "rgba(28, 28, 30, 0.88)",
    },
    Menu: {
      itemBg: "transparent",
      activeBarBorderWidth: 0,
      itemMarginInline: 0,
      itemHeight: 36,
      itemBorderRadius: 12,
    },
    Input: {
      borderRadius: 12,
      activeBorderColor: primaryColor,
      activeShadow: "0 0 0 3px rgba(250, 84, 28, 0.12)",
      addonBg: "rgba(255, 255, 255, 0.58)",
      hoverBorderColor: "rgba(250, 84, 28, 0.42)",
    },
    InputNumber: {
      borderRadius: 12,
      activeBorderColor: primaryColor,
      activeShadow: "0 0 0 3px rgba(250, 84, 28, 0.12)",
      hoverBorderColor: "rgba(250, 84, 28, 0.42)",
    },
    Select: {
      borderRadius: 12,
      optionSelectedBg: "rgba(250, 84, 28, 0.1)",
      optionSelectedColor: "rgb(154, 52, 18)",
      activeBorderColor: primaryColor,
      activeOutlineColor: "rgba(250, 84, 28, 0.12)",
      hoverBorderColor: "rgba(250, 84, 28, 0.42)",
    },
    Switch: {
      colorPrimary: primaryColor,
      colorPrimaryHover: primaryColorHover,
    },
    Form: {
      itemMarginBottom: 0,
      labelColor: "rgba(36, 37, 40, 0.78)",
      labelFontSize: 12,
    },
    Segmented: {},
  },
};

export default theme;
