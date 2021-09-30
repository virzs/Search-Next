/*
 * @Author: Vir
 * @Date: 2021-03-14 15:22:13
 * @Last Modified by: Vir
 * @Last Modified time: 2021-09-26 17:46:13
 */

import {
  checkedBg,
  latestImg,
  SetBackgroundParams,
} from '@/apis/setting/background';
import Copyright from '@/components/global/copyright';
import { SearchEngineValueTypes } from '@/data/engine';
import { PageProps } from '@/typings';
import { getAccount } from '@/views/setting/auth/utils/acount';
import { IconButton, Tooltip } from '@material-ui/core';
import { Bookmarks, Settings } from '@material-ui/icons';
import classNames from 'classnames';
import React from 'react';
import SearchInput from './components/search-input';
import Sites from './components/sites';

const IndexPage: React.FC<PageProps> = ({ history, ...props }) => {
  const [bg, setBg] = React.useState<SetBackgroundParams>();

  const handleSearch = (value: string, engine: SearchEngineValueTypes) => {
    window.open(`${engine.href}${value}`);
  };

  const setBackground = () => {
    const user = getAccount();
    const background = user.background;
    if (user && background) {
      switch (background.type) {
        case 'random':
          setBg(user.background.data);
          break;
        case 'everyday':
          latestImg().then((res) => {
            setBg(res.data.data[0]);
          });
          break;
        case 'link':
          setBg(user.background.data);
          break;
      }
    }
  };

  React.useEffect(() => {
    setBackground();
  }, []);

  return (
    <div
      className="index-page flex flex-col h-screen bg-cover bg-center"
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
        <SearchInput
          placeholder="请输入搜索内容"
          onPressEnter={handleSearch}
          onBtnClick={handleSearch}
        />
      </div>
      <div className="index-content-box flex-grow">
        <Sites />
      </div>
      <div className="index-copyright-box flex-grow max-h-8 text-center leading-8">
        <Copyright />
      </div>
    </div>
  );
};

export default IndexPage;
