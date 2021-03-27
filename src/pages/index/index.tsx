/*
 * @Author: Vir
 * @Date: 2021-03-14 15:22:13
 * @Last Modified by: Vir
 * @Last Modified time: 2021-03-27 17:51:29
 */

import { copyright as copyrightApi } from '@/apis/common';
import { list } from '@/apis/search';
import Copyright from '@/components/copyright';
import { ChangeLocales, SearchInput } from '@/components/global';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import './index.less';

interface CopyrightType {
  startTime: string; // 开始时间
  endTime?: string; // 结束时间
  href: string; // 网址
  author: string; // 作者
  custom?: string; // 自定义信息
  version?: string;
}

export default function IndexPage() {
  const [copyright, setCopyright] = useState<CopyrightType>({
    startTime: '',
    href: '',
    author: '',
  });

  const getList = () => {
    list().then((res) => {
      console.log(res.data);
    });
  };

  const getCopyright = () => {
    copyrightApi().then((res) => {
      setCopyright(res.data);
    });
  };

  React.useEffect(() => {
    getList();
    getCopyright();
  }, []);

  const inputChange = (value: string) => {
    console.log('search', value);
  };

  const inputBtnClick = (value: string) => {
    console.log('search btn', value);
  };

  const intl = useIntl();
  return (
    <div className="index">
      <div className="index-navbar">
        <ChangeLocales />
      </div>
      <div className="index-logo"></div>
      <div className="index-search-input">
        <SearchInput
          autoFocus
          onChange={inputChange}
          onBtnClick={inputBtnClick}
          placeholder={intl.formatMessage({ id: 'MAIN_SEARCH_PLACEHOLDER' })}
          primaryText={intl.formatMessage({ id: 'MAIN_SEARCH' })}
        ></SearchInput>
      </div>
      <div className="index-content"></div>
      <div className="index-copyright">
        <Copyright
          author={copyright.author}
          href={copyright.href}
          startTime={copyright.startTime}
        ></Copyright>
      </div>
    </div>
  );
}
