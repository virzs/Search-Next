/*
 * @Author: vir virs98@outlook.com
 * @Date: 2022-04-06 17:06:36
 * @LastEditors: vir virs98@outlook.com
 * @LastEditTime: 2022-07-22 13:44:00
 */

import { DarkThemeSettings, ThemeType } from '@/apis/setting/theme';
import Select from '@/components/md-custom/form/select';
import ContentList from '@/pages/setting/components/contentList';
import ContentTitle from '@/pages/setting/components/contentTitle';
import ItemCard from '@/pages/setting/components/itemCard';
import { Slider } from '@mui/material';
import React from 'react';
import useTheme from '@/hooks/settings/theme/theme';

const Theme: React.FC = () => {
  const [{ type = 'light', darkSettings }, { setTheme }] = useTheme();

  const handleThemeTypeChange = (
    val?: ThemeType,
    darkSettings?: DarkThemeSettings,
  ) => {
    setTheme && setTheme({ darkSettings, type: val });
  };

  const handleDarkThemeSettingChange = (name: string, val: number) => {
    const privData: DarkThemeSettings = {
      ...darkSettings,
      [name]: val,
    } as DarkThemeSettings;
    handleThemeTypeChange(type, privData);
  };

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
              value={type}
              onChange={(e) => handleThemeTypeChange(e.target.value)}
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
