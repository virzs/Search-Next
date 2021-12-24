/*
 * @Author: Vir
 * @Date: 2021-10-10 19:01:36
 * @Last Modified by: Vir
 * @Last Modified time: 2021-11-01 17:37:29
 */
import { BorderLinearProgress } from '@/components/md-custom/progress';
import { Router } from '@/config/router';
import { AuthData } from '@/data/account/interface';
import ContentList from '@/pages/setting/components/contentList';
import ItemCard from '@/pages/setting/components/itemCard';

import { PageProps } from '@/typings';
import { formatSize, storageSize } from '@/utils/common';
import { Alert, CardContent, LinearProgress } from '@material-ui/core';
import React from 'react';
import { getAccount } from '../auth/utils/acount';
import { useLocation, useNavigate } from 'react-router-dom';

const Data: React.FC<PageProps> = ({ route, children, ...props }) => {
  const history = useNavigate();
  const location = useLocation();
  const [list, setList] = React.useState<Router[]>([]);
  const [percent, setPercent] = React.useState<number>(0);
  const [accountData, setAccountData] = React.useState<AuthData[]>([]);
  const [occupySize, setOccupySize] = React.useState<string>('0KB');

  const getOccupySize = () => {
    const size = storageSize();
    /* JavaScript中的字符串是UTF-16，所以每个字符需要两个字节的内存。
      这意味着，虽然许多浏览器有5 MB的限制，但你只能存储2.5 M字符。
      浏览器可以自由地将数据存储在磁盘上，因此不可能测量实际字节数。
      开发者通常只关心他们可以存储多少字符，因为这是他们可以在应用中衡量的。
    */
    setPercent((size / 5242880) * 100 * 2);
    setOccupySize(formatSize(size * 2));
  };

  React.useEffect(() => {
    getOccupySize();
    const data: AuthData = getAccount();
    setList(route?.routes || []);
  }, []);

  return (
    <div>
      <div className="mb-4">
        <div className="mt-2">
          <div className="flex justify-between mb-2 text-sm">
            <p>占用空间</p>
            <p>
              已使用: <span>{occupySize}</span> / <span>5MB</span>
            </p>
          </div>
          <BorderLinearProgress variant="determinate" value={percent} />
        </div>
      </div>
      <Alert severity="warning" style={{ marginBottom: '8px' }}>
        不同浏览器支持的 localStorage 和 sessionStorage
        容量上限不同。当前容量设定为标准容量 5MB。
        <a href="http://dev-test.nemikor.com/web-storage/support-test/">
          测试浏览器本地存储容量上限。
        </a>
      </Alert>
      <ContentList>
        {list.map((i) => (
          <ItemCard
            key={i.path}
            title={i.title}
            icon={i.icon}
            onClick={() => history(i.path)}
          ></ItemCard>
        ))}
      </ContentList>
    </div>
  );
};

export default Data;
