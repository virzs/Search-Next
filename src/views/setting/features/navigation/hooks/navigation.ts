/*
 * @Author: vir virs98@outlook.com
 * @Date: 2022-07-13 15:09:09
 * @LastEditors: vir virs98@outlook.com
 * @LastEditTime: 2022-07-13 16:54:54
 */

import {
  getNavigation,
  NavigationData,
  setNavigation,
} from '@/apis/setting/navigation';
import { useEffect, useState } from 'react';

export interface UseNavigationAction {
  refresh: () => void;
  setNavigation: (data: Partial<NavigationData>) => void;
}

export type UseNavigationResult = [NavigationData, UseNavigationAction];

const useNavigation = (): UseNavigationResult => {
  const [type, setType] = useState<NavigationData['type']>('page');
  const [cols, setCols] = useState<NavigationData['cols']>(3);

  const setData = (data: Partial<NavigationData>) => {
    data?.type && setType(data.type);
    data?.cols && setCols(data.cols);
    setNavigation({ type: data?.type ?? type, cols: data?.cols ?? cols });
  };

  const getData = () => {
    const result = getNavigation();
    result?.type && setType(result.type);
    result?.cols && setCols(result.cols);
  };

  const refresh = () => {
    getData();
  };

  useEffect(() => {
    getData();
  }, []);

  return [
    { type, cols },
    { refresh, setNavigation: setData },
  ];
};

export default useNavigation;
