/*
 * @Author: vir virs98@outlook.com
 * @Date: 2022-07-08 11:36:54
 * @LastEditors: vir virs98@outlook.com
 * @LastEditTime: 2022-07-13 14:25:01
 */

import { DarkThemeSettings, getTheme, ThemeType } from '@/apis/setting/theme';
import { auto, disable, enable } from 'darkreader';
import { useEffect, useState } from 'react';
import { setTheme } from '../../../../../apis/setting/theme';

export interface UseThemeData {
  type: ThemeType;
  darkSettings: DarkThemeSettings;
}

export interface UseThemeAction {
  setTheme: (data: Partial<UseThemeData>) => void;
  refresh: () => void;
}

const useTheme = (): [UseThemeData, UseThemeAction] => {
  const [type, setType] = useState<ThemeType>('light');
  const [darkSettings, setDarkSetting] = useState<DarkThemeSettings>({
    brightness: 100,
    contrast: 100,
    grayscale: 0,
    sepia: 0,
  });

  const getData = () => {
    const result = getTheme();
    result?.type && setType(result.type);
    result?.darkSettings && setDarkSetting(result.darkSettings);
  };

  const setData = (data: Partial<UseThemeData>) => {
    data.type && setType(data.type);
    data.darkSettings && setDarkSetting(data.darkSettings);
    setTheme({
      type: data.type ?? type,
      darkSettings: data.darkSettings ?? darkSettings,
    });
  };

  const refresh = () => {
    getData();
  };

  useEffect(() => {
    switch (type) {
      case 'system':
        auto({});
        break;
      case 'light':
        disable();
        break;
      case 'dark':
        enable(darkSettings);
        break;
    }
  }, [type, darkSettings]);

  useEffect(() => {
    getData();
  }, []);

  return [
    { type, darkSettings },
    { refresh, setTheme: setData },
  ];
};

export default useTheme;
