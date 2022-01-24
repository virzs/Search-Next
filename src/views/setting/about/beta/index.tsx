/*
 * @Author: Vir
 * @Date: 2022-01-24 14:45:01
 * @Last Modified by: Vir
 * @Last Modified time: 2022-01-24 15:33:33
 */

import { isBeta, setBeta } from '@/apis/auth';
import Markdown from '@/components/global/markdown';
import ContentList from '@/pages/setting/components/contentList';
import ContentTitle from '@/pages/setting/components/contentTitle';
import ItemCard from '@/pages/setting/components/itemCard';
import { BugReportOutlined } from '@mui/icons-material';
import { Switch } from '@mui/material';
import React, { useEffect, useState } from 'react';
import Docs from './docs.mdx';

const Beta: React.FC = () => {
  const [checked, setChecked] = useState<boolean>(false);

  const checkChange = (v: React.ChangeEvent<HTMLInputElement>) => {
    const val = v.target.checked;
    setBeta(val);
    setChecked(val);
  };

  useEffect(() => {
    setChecked(isBeta());
  }, []);

  return (
    <div>
      <ContentList>
        <ContentTitle title="加入用户体验计划" />
        <ItemCard
          icon={<BugReportOutlined />}
          title="用户体验计划"
          desc="获取正在开发中功能的预览权限"
          action={<Switch checked={checked} onChange={checkChange} />}
        />
        <ContentTitle title="用户体验计划说明" />
        <div className="p-2">
          <Markdown source={Docs} />
        </div>
      </ContentList>
    </div>
  );
};

export default Beta;
