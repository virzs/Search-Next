/*
 * @Author: Vir
 * @Date: 2021-06-10 11:08:48
 * @Last Modified by: Vir
 * @Last Modified time: 2021-06-18 15:58:59
 */

import MenuLayout from '@/components/global/menu-layout';
import { Navigation } from '@/data/navigation/interface';
import React from 'react';
import { history } from 'umi';
import allSetting from './allSetting';

export type SettingRouteState = { search?: string } | null | undefined;

const SettingPage: React.FC = () => {
  const [selected, setSelected] = React.useState<Navigation>({} as Navigation);

  React.useEffect(() => {
    // init state
    const selected = allSetting.find((i) => i.component);
    const state: SettingRouteState = history.location?.state;
    if (selected) setSelected(selected);
    if (state?.search && selected) {
      const sel = allSetting.find((i) => i.id === state?.search);
      setSelected(sel ? sel : selected);
    }
  }, []);

  return <MenuLayout title="设置" basePath="/setting" menu={allSetting} />;
};

export default SettingPage;
