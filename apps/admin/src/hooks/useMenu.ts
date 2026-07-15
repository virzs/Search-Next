import Menus from "../routes/menus";
import { Menu } from "../utils/menu";
import { matchPermission, useAccess } from "@/contexts/AccessContext";

const useMenu = (): Menu[] => {
  const access = useAccess();

  const filterMenus = (menus: Menu[]): Menu[] => {
    return menus.reduce<Menu[]>((result, menu) => {
      const hadChildren = Boolean(menu.children?.length);
      const children = hadChildren ? filterMenus(menu.children as Menu[]) : undefined;
      const hasVisibleChildren = Boolean(children?.some((child) => !child.hideInMenu));
      const canAccess = matchPermission(menu.auth, access);

      if (menu.auth !== undefined && !canAccess) {
        return result;
      }

      if (menu.auth === undefined && hadChildren && !hasVisibleChildren) {
        return result;
      }

      result.push({
        ...menu,
        children,
      });

      return result;
    }, []);
  };

  return filterMenus(Menus);
};

export default useMenu;
