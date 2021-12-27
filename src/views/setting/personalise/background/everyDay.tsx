/*
 * @Author: Vir
 * @Date: 2021-09-26 17:39:27
 * @Last Modified by: Vir
 * @Last Modified time: 2021-10-22 15:27:16
 */

import { AuthBackgroundRandomData } from '@/data/account/interface';
import { css } from '@emotion/css';
import { Alert } from '@mui/material';
import classNames from 'classnames';
import { Image } from 'antd';
import React from 'react';

export interface EveryDayProps {
  data: AuthBackgroundRandomData;
}

const EveryDay: React.FC<EveryDayProps> = ({ data }) => {
  const [url, setUrl] = React.useState<string>('');

  React.useEffect(() => {
    if (data && data?.url) {
      setUrl(data?.url);
    }
  }, [data]);

  return (
    <div>
      <Alert severity="info">每天更新背景，来源：必应壁纸</Alert>
      {url && (
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
          <Image src={url} />
        </div>
      )}
    </div>
  );
};

export default EveryDay;
