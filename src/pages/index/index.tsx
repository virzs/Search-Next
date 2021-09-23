/*
 * @Author: Vir
 * @Date: 2021-03-14 15:22:13
 * @Last Modified by: Vir
 * @Last Modified time: 2021-09-12 17:46:58
 */

import Copyright from '@/components/global/copyright';
import { PageProps } from '@/typings';
import { IconButton, Tooltip } from '@material-ui/core';
import { Bookmarks, Settings } from '@material-ui/icons';
import React from 'react';
import SearchInput from './components/search-input';

const IndexPage: React.FC<PageProps> = ({ history, ...props }) => {
  const handleSearch = (value: string) => {
    window.open(value);
  };

  return (
    <div className="index-page flex flex-col h-screen">
      <div className="index-navbar-box bg-gray-500 flex-grow max-h-12 text-right align-middle">
        <Tooltip title="网址导航">
          <IconButton onClick={() => history.push('/navigation')}>
            <Bookmarks />
          </IconButton>
        </Tooltip>
        <Tooltip title="设置">
          <IconButton onClick={() => history.push('/setting')}>
            <Settings />
          </IconButton>
        </Tooltip>
      </div>
      <div className="index-logo-box bg-red-500 flex-grow max-h-48 sm:max-h-72"></div>
      <div className="index-input-box bg-yellow-500 flex-grow max-h-20 flex justify-center items-center">
        <SearchInput placeholder="请输入搜索内容" />
      </div>
      <div className="index-content-box bg-green-500 flex-grow"></div>
      <div className="index-copyright-box bg-blue-500 flex-grow max-h-8 text-center leading-8">
        <Copyright />
      </div>
    </div>
  );
};

export default IndexPage;
