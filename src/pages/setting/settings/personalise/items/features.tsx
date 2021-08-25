/*
 * @Author: Vir
 * @Date: 2021-06-18 11:42:41
 * @Last Modified by: Vir
 * @Last Modified time: 2021-06-27 21:34:11
 */

import { Button, Switch } from '@material-ui/core';
import React from 'react';
import ContentItemTitle from '@/components/global/menu-layout/contentItemTitle';
import { ContentList, ContentListItem } from '../../components/contentList';

import store from 'store';
import { Alert } from '@material-ui/lab';
const FeaturesItem: React.FC = () => {
  const [checked, setChecked] = React.useState<boolean>(false);

  const handleToggle = (val: string) => {};
  return (
    <div>
      <ContentItemTitle
        title="功能"
        desc="修改主页显示内容，部分设置可能随开发进度变动。"
      />
      <Alert severity="warning">这是一个正在开发的功能，不保证可用性。</Alert>
      <ContentList title="常用网址">
        <ContentListItem
          text="显示常用网址"
          secondaryAction={
            <Switch
              edge="end"
              onChange={() => handleToggle('wifi')}
              checked={checked}
              inputProps={{ 'aria-labelledby': 'switch-list-label-topsite' }}
            />
          }
        ></ContentListItem>
      </ContentList>
    </div>
  );
};

export default FeaturesItem;
