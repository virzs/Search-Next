/*
 * @Author: vir virs98@outlook.com
 * @Date: 2022-03-21 20:36:38
 * @LastEditors: vir virs98@outlook.com
 * @LastEditTime: 2022-07-13 16:53:33
 */
import Select from '@/components/md-custom/form/select';
import ContentList from '@/pages/setting/components/contentList';
import ItemCard from '@/pages/setting/components/itemCard';

import { PageProps } from '@/typings';
import React from 'react';
import useNavigation from './hooks/navigation';

const Navigation: React.FC<PageProps> = (props) => {
  const [{ type, cols }, { setNavigation }] = useNavigation();

  const options = [
    {
      label: '抽屉',
      value: 'drawer',
    },
    {
      label: '页面',
      value: 'page',
    },
  ];

  const colOptions = [
    {
      label: '2个',
      value: 2,
    },
    {
      label: '3个',
      value: 3,
    },
    {
      label: '4个',
      value: 4,
    },
  ];

  return (
    <div {...props}>
      <ContentList>
        <ItemCard
          title="默认效果"
          desc="设置首页点击导航按钮后导航的显示方式"
          action={
            <Select
              label="效果"
              value={type}
              size="small"
              onChange={(e) => setNavigation({ type: e.target.value })}
              options={options}
            />
          }
        ></ItemCard>
        <ItemCard
          title="抽屉模式每行个数"
          desc="设置抽屉模式下，每行显示网站的个数"
          action={
            <Select
              label="每行个数"
              value={cols}
              size="small"
              onChange={(e) => setNavigation({ cols: e.target.value })}
              options={colOptions}
            />
          }
        ></ItemCard>
      </ContentList>
    </div>
  );
};

export default Navigation;
