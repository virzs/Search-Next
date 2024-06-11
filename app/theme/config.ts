import type { ThemeConfig } from "antd";

const theme: ThemeConfig = {
  token: {
    colorPrimary: "#171717",
  },
  components: {
    Button: {
      defaultShadow: "none",
      primaryShadow: "none",
    },
  },
};

export default theme;
