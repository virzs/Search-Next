/*
 * @Author: Vir
 * @Date: 2021-06-16 14:34:10
 * @Last Modified by: Vir
 * @Last Modified time: 2021-06-16 16:01:06
 */

import {
  getAllLocales,
  getLocale,
  setLocale,
} from '@/.umi/plugin-locale/localeExports';
import ContentItemTitle from '@/components/global/menu-layout/contentItemTitle';
import {
  Radio,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@material-ui/core';
import { useSnackbar } from 'notistack';
import React from 'react';

export interface SelectLocalesTypes {
  label: string;
  value: 'zh-CN' | 'en-US';
}

const LocalesItem: React.FC = () => {
  const [checked, setChecked] = React.useState<string>(getLocale());
  const { enqueueSnackbar } = useSnackbar();

  const selectLocalesValue: SelectLocalesTypes[] = [
    {
      label: '中文',
      value: 'zh-CN',
    },
    {
      label: 'English',
      value: 'en-US',
    },
  ];

  const handleSetLocale = (val: string) => {
    setChecked(val);
    setLocale(val);
    enqueueSnackbar('修改成功', { variant: 'success' });
  };

  return (
    <div>
      <ContentItemTitle
        title="首选语言"
        desc="网站将以受支持语言列表中的第一种语言进行显示。注意，在当前开发版本，并不是所有的文字都支持此设置。"
      ></ContentItemTitle>
      <List dense>
        {selectLocalesValue.map((i) => {
          const labelId = `checkbox-list-label-${i.value}`;
          return (
            <ListItem
              button
              key={i.value}
              onClick={() => handleSetLocale(i.value)}
            >
              <ListItemIcon>
                <Radio
                  checked={i.value === checked}
                  edge="start"
                  onChange={(e) => handleSetLocale(e.target.value)}
                  disableRipple
                  inputProps={{ 'aria-labelledby': labelId }}
                />
              </ListItemIcon>
              <ListItemText id={labelId} primary={i.label} />
            </ListItem>
          );
        })}
      </List>
    </div>
  );
};

export default LocalesItem;
