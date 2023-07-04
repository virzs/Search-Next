import App from ".";
import widgetBaseConfig from "../config";

const appConfig = {
  w: 1,
  h: 1,
  noResize: true,
  el: App,
  ...widgetBaseConfig,
};

export default appConfig;
