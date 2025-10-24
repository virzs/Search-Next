import { baseGetRequest } from "@/utils/axios";
import { DesktopListItem } from "zs_library";

export interface DefaultUserConfig {
  config: {
    list: DesktopListItem[];
  };
}

/**
 * 获取默认用户配置
 * @returns
 */
export const getDefaultUserConfig = () => {
  return baseGetRequest<DefaultUserConfig>("/tabs/desktop/config/user/default")();
};
