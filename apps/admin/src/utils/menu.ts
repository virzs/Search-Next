import Menus from "@/routes/menus";
import { MenuDataItem } from "@ant-design/pro-components";

export interface Menu extends MenuDataItem {}

export function getMenuByPath(path: string, menus?: Menu[]): Menu | undefined {
  const mergedMenus = menus || Menus;

  for (let i = 0; i < mergedMenus.length; i++) {
    const menu = mergedMenus[i];
    if (menu.path === path) {
      return menu;
    }
    if (menu.children?.length) {
      const result = getMenuByPath(path, menu.children);
      if (result) {
        return result;
      }
    }
  }
  return undefined;
}
