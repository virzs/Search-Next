/*
 * @Author: Vir
 * @Date: 2021-09-23 11:39:25
 * @Last Modified by: Vir
 * @Last Modified time: 2022-06-15 17:46:43
 */

import Select from '@/components/md-custom/form/select';
import ItemAccordion from '@/pages/setting/components/itemAccordion';
import React, { useEffect } from 'react';
import Example from '../components/example';
import Link from './bgTypes/link';
import LoremPicsum from './bgTypes/loremPicsum';
import Bing from './bgTypes/bing';
import BingEveryDay from './bgTypes/bingEveryDay';
import Color from './bgTypes/color';
import { BackgroundType } from '@/apis/setting/background';
import useBackground from './hooks/background';

export interface BgOptions {
  label: string;
  value: BackgroundType;
  canSelect?: boolean;
  autoExpaneded: boolean;
}

// TODO 设置为必应壁纸时，历史记录及细节重构

const Background: React.FC = () => {
  const [expanded, setExpanded] = React.useState(false);

  const bgOptions: BgOptions[] = [
    { label: '纯色', value: 'color', canSelect: true, autoExpaneded: false },
    {
      label: '必应壁纸',
      value: 'bing',
      canSelect: true,
      autoExpaneded: true,
    },
    {
      label: 'Lorem Picsum',
      value: 'picsum',
      canSelect: true,
      autoExpaneded: true,
    },
    {
      label: '每日一图',
      value: 'bing_everyday',
      canSelect: true,
      autoExpaneded: false,
    },
    { label: '在线图片', value: 'link', canSelect: true, autoExpaneded: true },
  ];

  const [data, action] = useBackground();
  const { type, color, bing, picsum, bing_everyday, link } = data;
  const { onChange } = action;

  useEffect(() => {
    const opt = bgOptions.find((item) => item.value === type);
    opt?.autoExpaneded && setExpanded(true);
  }, [type]);

  return (
    <div>
      <Example data={{}} />
      <div className="flex gap-2 flex-col">
        <ItemAccordion
          expanded={expanded}
          onChange={(_, expanded) => {
            setExpanded(expanded);
          }}
          title="个性化设置背景"
          desc="背景设置主要适用于主页"
          action={
            <Select
              label="背景类型"
              value={type}
              size="small"
              onChange={(e) => {
                onChange({ type: e.target.value });
              }}
              options={bgOptions}
            />
          }
          disableDetailPadding
        >
          {(() => {
            switch (type) {
              case 'color':
                return <Color />;
              case 'bing':
                return (
                  <Bing
                    dataSource={bing}
                    onChange={(data) => {
                      onChange({ type, bing: data });
                    }}
                  />
                );
              case 'bing_everyday':
                return <BingEveryDay data={{}} />;
              case 'picsum':
                return <LoremPicsum />;
              case 'link':
                return <Link data={{}} onChange={(url) => {}} />;
              default:
                return null;
            }
          })()}
        </ItemAccordion>
      </div>
    </div>
  );
};

export default Background;
