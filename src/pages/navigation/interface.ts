/*
 * @Author: Vir
 * @Date: 2021-07-25 18:40:38
 * @Last Modified by: Vir
 * @Last Modified time: 2021-07-25 18:43:02
 */

export interface Website {
  id: string;
  name: string;
  url: string;
  icon?: string;
  color?: string;
  isShow?: boolean;
}

export interface Navigation {
  id: string;
  name: string;
  path: string;
  icon?: JSX.Element;
  color?: string;
  isShow?: boolean;
  children: Website[];
}
