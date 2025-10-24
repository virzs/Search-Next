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
  },
};

export default theme;
