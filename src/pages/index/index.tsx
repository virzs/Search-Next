/*
 * @Author: Vir
 * @Date: 2021-03-14 15:22:13
 * @Last Modified by: Vir
 * @Last Modified time: 2021-09-23 16:50:26
 */

import { checkedBg, SetBackgroundParams } from '@/apis/setting/background';
import Copyright from '@/components/global/copyright';
import { PageProps } from '@/typings';
import { getAccount } from '@/views/setting/auth/utils/acount';
import { IconButton, Tooltip } from '@material-ui/core';
import { Bookmarks, Settings } from '@material-ui/icons';
import classNames from 'classnames';
import React from 'react';
import SearchInput from './components/search-input';

const IndexPage: React.FC<PageProps> = ({ history, ...props }) => {
  const [bg, setBg] = React.useState<SetBackgroundParams>();

  const handleSearch = (value: string) => {
    window.open(value);
  };

  const setBackground = () => {
    const user = getAccount();
    if (user && user.background && user.background.data) {
      setBg(user.background.data);
    }
  };

  React.useEffect(() => {
    setBackground();
  }, []);

  return (
    <div
      className="index-page flex flex-col h-screen"
      style={{ backgroundImage: bg ? `url('${bg?.url}')` : undefined }}
    >
      <div className="index-navbar-box flex-grow max-h-12 text-right align-middle">
        <Tooltip title="网址导航">
          <IconButton onClick={() => history.push('/navigation')}>
            <Bookmarks
              className={classNames({
                'text-white': !!bg,
              })}
            />
          </IconButton>
        </Tooltip>
        <Tooltip title="设置">
          <IconButton onClick={() => history.push('/setting')}>
            <Settings
              className={classNames({
                'text-white': !!bg,
              })}
            />
          </IconButton>
        </Tooltip>
      </div>
      <div className="index-logo-box flex-grow max-h-48 sm:max-h-72"></div>
      <div className="index-input-box flex-grow max-h-20 flex justify-center items-center">
        <SearchInput placeholder="请输入搜索内容" />
      </div>
      <div className="index-content-box flex-grow"></div>
      <div className="index-copyright-box flex-grow max-h-8 text-center leading-8">
        <Copyright />
      </div>
    </div>
  );
};

export default IndexPage;
