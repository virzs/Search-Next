/*
 * @Author: vir virs98@outlook.com
 * @Date: 2022-08-05 16:43:47
 * @LastEditors: vir virs98@outlook.com
 * @LastEditTime: 2022-08-09 16:09:01
 */

import SvgIcon from '@/components/global/svgIcon';
import Link from '@/pages/setting/components/contentLinkList/link';
import ContentList from '@/pages/setting/components/contentList';
import ContentTitle from '@/pages/setting/components/contentTitle';
import { Alert, AlertTitle } from '@mui/material';
import React, { FC, useMemo } from 'react';
import ids from 'virtual:svg-icons-names';

const Icons: FC = () => {
  const weatherIcons = useMemo(() => {
    return ids.filter((i) => !i.includes('win11Color'));
  }, [ids]);

  const win11ColorIcons = useMemo(() => {
    return ids.filter((i) => i.includes('win11Color'));
  }, [ids]);

  return (
    <div>
      <Alert severity="warning">
        <AlertTitle>注意</AlertTitle>
        部分图标存在版权，仅限网页地址包含 <strong>search.virs.xyz</strong>{' '}
        中的页面使用。由此造成的侵权问题，本站概不负责。
      </Alert>
      <ContentTitle title="Windows 11 Color 图标" />
      <Link icon="link" text="Icons8" href="https://icons8.com"></Link>
      <ContentList className="grid grid-cols-6 gap-3">
        {win11ColorIcons.map((i) => (
          <div
            key={i}
            className="px-3 py-4 shadow flex flex-col items-center justify-center gap-2"
          >
            <SvgIcon name={i.replace('icon-', '')} />
            <p className="whitespace-nowrap text-ellipsis overflow-hidden w-full text-center">
              {i.replace('icon-win11Color-', '')}
            </p>
          </div>
        ))}
      </ContentList>
      <ContentTitle title="和风天气图标" />
      <Link
        icon="link"
        text="https://github.com/qwd/Icons"
        href="https://github.com/qwd/Icons"
      ></Link>
      <ContentList className="grid grid-cols-6 gap-3">
        {weatherIcons.map((i) => (
          <div
            key={i}
            className="px-3 py-4 shadow flex flex-col items-center justify-center gap-2"
          >
            <SvgIcon name={i.replace('icon-', '')} />
            <p className="whitespace-nowrap text-ellipsis overflow-hidden w-full text-center">
              {i.replace('icon-', '')}
            </p>
          </div>
        ))}
      </ContentList>
    </div>
  );
};

export default Icons;
