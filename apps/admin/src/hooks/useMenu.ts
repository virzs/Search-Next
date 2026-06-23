import Menus from "../routes/menus";
import { Menu } from "../utils/menu";

const useMenu = (): Menu[] => {
  // TODO: 根据权限过滤菜单
  return Menus;
};

export default useMenu;
