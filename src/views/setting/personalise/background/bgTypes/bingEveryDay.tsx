/*
 * @Author: Vir
 * @Date: 2021-09-26 17:39:27
 * @Last Modified by: Vir
 * @Last Modified time: 2022-06-20 17:27:54
 */

import { css } from '@emotion/css';
import { Alert } from '@mui/material';
import classNames from 'classnames';
import { Image } from 'antd';
import React, { FC, useEffect, useState } from 'react';
import { UseBackgroundTypeBingEverydayData } from '@/apis/setting/background';
import ItemHeader from '@/components/layout/menu-layout/itemHeader';

export interface EveryDayProps {
  dataSource?: UseBackgroundTypeBingEverydayData;
}

const BingEveryDay: FC<EveryDayProps> = ({ dataSource }) => {
  const [data, setData] = useState<UseBackgroundTypeBingEverydayData['data']>();

  useEffect(() => {
    if (dataSource && dataSource?.data) {
      setData(dataSource?.data);
    }
  }, [dataSource]);

  return (
    <div>
      <Alert severity="info">每天更新背景，来源：必应壁纸</Alert>
      {data?.url && (
        <div
          className={classNames(
            'm-2 rounded overflow-hidden',
            css`
              .ant-image {
                display: block;
              }
            `,
          )}
        >
          <ItemHeader
            title={data?.title}
            desc={data?.copyright}
            descLink={data?.copyrightlink}
          />
          <Image src={data?.url} preview={false} alt={data?.copyright} />
        </div>
      )}
    </div>
  );
};

export default BingEveryDay;
