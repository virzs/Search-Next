/*
 * @Author: Vir
 * @Date: 2021-07-25 18:40:38
 * @Last Modified by: Vir
 * @Last Modified time: 2021-11-04 14:49:11
 */

export interface Website {
  id: string;
  name: string;
  url: string;
  intro?: string;
  icon?: string;
  color?: string;
  isShow?: boolean;
}

export type NavigationType = 'website' | 'navigation';

export interface Navigation {
  id: string;
  name: string;
  intro?: string;
  path?: string;
  url?: string;
  icon?: any;
  color?: string;
  isShow?: boolean;
  type?: NavigationType;
  children?: Website[] | Navigation[] | '';
}
