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
import React, { useEffect, useState } from 'react';

const Theme: React.FC = () => {
  const [theme, setTheme] = React.useState<ThemeSetting>(
    authDefaultData.theme as ThemeSetting,
  );
  const [darkSettings, setDarkSettings] = useState<DarkThemeSettings>(
    {} as DarkThemeSettings,
  );

  const handleThemeTypeChange = (
    val: ThemeType,
    darkSettings: DarkThemeSettings,
  ) => {
    setTheme({ ...theme, darkSettings, type: val });
    switch (val) {
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
    updateUserThemeSetting({
      ...theme,
      darkSettings,
      type: val,
    });
  };

  const handleDarkThemeSettingChange = (name: string, val: number) => {
    const darkSettings = { ...theme.darkSettings, [name]: val };
    setTheme({
      ...theme,
      darkSettings,
    });
    setDarkSettings(darkSettings);
    handleThemeTypeChange(theme.type, darkSettings);
  };

  useEffect(() => {
    getUserThemeSetting().then((res) => {
      setTheme(res);
      res?.darkSettings && setDarkSettings({ ...res.darkSettings });
      console.log(res);
    });
  }, []);

  const renderDarkSliders = () => {
    const {
      brightness = 100,
      contrast = 100,
      grayscale = 0,
      sepia = 0,
    } = darkSettings;

    const sliders = [
      {
        title: '亮度',
        desc: '设置深色模式亮度',
        value: brightness,
        min: 30,
        max: 100,
        onChange: (e: Event, val: number) =>
          handleDarkThemeSettingChange('brightness', val as number),
      },
      {
        title: '对比度',
        desc: '设置深色模式对比度',
        value: contrast,
        min: 40,
        max: 100,
        onChange: (e: Event, val: number) =>
          handleDarkThemeSettingChange('contrast', val as number),
      },
      {
        title: '灰度',
        desc: '设置深色模式灰度',
        value: grayscale,
        min: 0,
        max: 100,
        onChange: (e: Event, val: number) =>
          handleDarkThemeSettingChange('grayscale', val as number),
      },
      {
        title: '色相',
        desc: '设置深色模式色相',
        value: sepia,
        min: 0,
        max: 100,
        onChange: (e: Event, val: number) =>
          handleDarkThemeSettingChange('sepia', val as number),
      },
    ];

    return sliders.map((item, index) => (
      <ItemCard
        title={item.title}
        desc={item.desc}
        key={index}
        action={
          <Slider
            style={{ width: '100px' }}
            valueLabelDisplay="auto"
            min={item.min}
            max={item.max}
            value={item.value}
            onChange={(e, val) => item.onChange(e, val as number)}
          />
        }
      />
    ));
  };

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
        {/* <ItemCard
          title="自动开启"
          desc="设置是否自动开启深色模式"
          action={<Switch />}
        /> */}
        {/* <ItemAccordion
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
        </ItemAccordion> */}
        {renderDarkSliders()}
      </ContentList>
    </div>
  );
};

export default Theme;
