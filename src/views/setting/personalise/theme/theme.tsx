/*
 * @Author: Vir
 * @Date: 2021-09-24 13:49:01
 * @Last Modified by:   Vir
 * @Last Modified time: 2021-09-24 13:49:01
 */

import { getUserThemeSetting, updateUserThemeSetting } from '@/apis/theme';
import Select from '@/components/md-custom/form/select';
import { authDefaultData } from '@/data/account/default';
import {
  DarkThemeSettings,
  Theme as ThemeSetting,
  ThemeType,
} from '@/data/account/interface';
import ContentList from '@/pages/setting/components/contentList';
import ContentTitle from '@/pages/setting/components/contentTitle';
import ItemAccordion from '@/pages/setting/components/itemAccordion';
import ItemCard from '@/pages/setting/components/itemCard';
import { Slider, Switch } from '@mui/material';
import { auto, disable, enable } from 'darkreader';
import React, { useEffect } from 'react';

const Theme: React.FC = () => {
  const [theme, setTheme] = React.useState<ThemeSetting>(
    authDefaultData.theme as ThemeSetting,
  );

  const handleThemeTypeChange = (
    val: ThemeType,
    darkSettings?: DarkThemeSettings,
  ) => {
    setTheme({ ...theme, type: val });
    switch (val) {
      case 'system':
        auto({});
        break;
      case 'light':
        disable();
        break;
      case 'dark':
        enable(darkSettings ? darkSettings : theme.darkSettings);
        break;
    }
    updateUserThemeSetting({
      ...theme,
      darkSettings: darkSettings ? darkSettings : theme.darkSettings,
    });
  };

  const handleDarkThemeSettingChange = (name: string, val: number) => {
    const darkSettings = { ...theme.darkSettings, [name]: val };
    setTheme({
      ...theme,
      darkSettings,
    });
    handleThemeTypeChange(theme.type, darkSettings);
  };

  useEffect(() => {
    getUserThemeSetting().then((res) => {
      setTheme(res);
      console.log(res);
    });
  }, []);

  return (
    <div>
      <ContentList>
        <ContentTitle title="基础设置" />
        <ItemCard
          title="整体外观"
          desc="适用于首页、导航页、设置页的样式"
          action={
            <Select
              label="整体外观"
              options={[
                {
                  label: '跟随系统',
                  value: 'system',
                },
                {
                  label: '浅色',
                  value: 'light',
                },
                {
                  label: '深色',
                  value: 'dark',
                },
              ]}
              value={theme.type}
              onChange={(e) =>
                handleThemeTypeChange(e.target.value, theme.darkSettings)
              }
              size="small"
            />
          }
        />
        <ContentTitle title="深色模式详细设置" />
        <ItemCard
          title="自动开启"
          desc="设置是否自动开启深色模式"
          action={<Switch />}
        />
        <ItemAccordion
          title="定时开启深色模式"
          desc="设置是否定时开启深色模式"
          action={
            <Select
              label="定时开启"
              value={'time'}
              size="small"
              options={[
                {
                  label: '日出日落模式',
                  value: 'sunrise',
                },
                {
                  label: '自定义时间',
                  value: 'time',
                },
              ]}
            />
          }
        >
          <ContentList>
            <ItemCard title="开始时间" desc="自定义设置深色模式开启时间" />
            <ItemCard title="关闭时间" desc="自定义设置深色模式关闭时间" />
          </ContentList>
        </ItemAccordion>
        <ItemCard
          title="亮度"
          desc="设置深色模式亮度"
          action={
            <Slider
              style={{ width: '100px' }}
              valueLabelDisplay="auto"
              min={0}
              max={100}
              value={theme.darkSettings.brightness}
              onChange={(e, val) =>
                handleDarkThemeSettingChange('brightness', val as number)
              }
            />
          }
        />
        <ItemCard
          title="对比度"
          desc="设置深色模式对比度"
          action={
            <Slider
              style={{ width: '100px' }}
              valueLabelDisplay="auto"
              min={0}
              max={100}
              value={theme.darkSettings.contrast}
              onChange={(e, val) =>
                handleDarkThemeSettingChange('contrast', val as number)
              }
            />
          }
        />
        <ItemCard
          title="灰度"
          desc="设置深色模式灰度"
          action={
            <Slider
              style={{ width: '100px' }}
              valueLabelDisplay="auto"
              min={0}
              max={100}
              value={theme.darkSettings.grayscale}
              onChange={(e, val) =>
                handleDarkThemeSettingChange('grayscale', val as number)
              }
            />
          }
        />
        <ItemCard
          title="棕褐色滤镜"
          desc="设置深色模式棕褐色滤镜"
          action={
            <Slider
              style={{ width: '100px' }}
              valueLabelDisplay="auto"
              min={0}
              max={100}
              value={theme.darkSettings.sepia}
              onChange={(e, val) =>
                handleDarkThemeSettingChange('sepia', val as number)
              }
            />
          }
        />
      </ContentList>
    </div>
  );
};

export default Theme;
