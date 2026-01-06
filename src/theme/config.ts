import type { ThemeConfig } from "antd";

const theme: ThemeConfig = {
  token: {
    colorPrimary: "rgb(250, 84, 28)",
  },
  components: {
    Button: {
      defaultShadow: "none",
      primaryShadow: "none",
    },
    Menu: {
      itemBg: 'transparent',
      activeBarBorderWidth: 0,
      itemMarginInline: 0,
      itemHeight: 36,
    },
    Segmented: {
    }
  },
};

export default theme;
