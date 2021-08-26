/*
 * @Author: Vir
 * @Date: 2021-07-25 00:32:56
 * @Last Modified by: Vir
 * @Last Modified time: 2021-07-25 18:46:02
 */

export interface MenuLayoutMenu {
  id: string;
  name: string; // 显示名称
  path: string; // 路径
  icon?: JSX.Element; // 图标
  [x: string]: any;
}

export interface MenuLayoutProps {
  title?: string;
  basePath?: string;
  menu: MenuLayoutMenu[];
  children?: any;
  onChange?: (id: string, item: MenuLayoutMenu) => void;
  showCopyright?: boolean;
}
