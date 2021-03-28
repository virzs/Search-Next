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
import { SearchEngineValueTypes } from '@/data/engine';
import { CopyrightType } from '@/data/main';
import { Chip } from '@material-ui/core';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import './index.less';

interface CopyrightTypeWithVersion extends CopyrightType {
  version?: string;
}

export default function IndexPage() {
  const [copyright, setCopyright] = useState({} as CopyrightTypeWithVersion);
  const [engineList, setEngineList] = useState([] as SearchEngineValueTypes[]);

  const getList = () => {
    list().then((res) => {
      setEngineList(res.data);
    });
  };

  const getCopyright = () => {
    copyrightApi().then((res) => {
      setCopyright(res.data);
    });
  };

  useEffect(() => {
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
      <div className="index-navbar-box">
        <ChangeLocales />
      </div>
      <div className="index-logo-box"></div>
      <div className="index-search-box">
        <div className="search-engine-label">
          {engineList.map((i) => (
            <Chip className="engine-chip" size="small" label={i.name}></Chip>
          ))}
        </div>
        <SearchInput
          autoFocus
          onChange={inputChange}
          onBtnClick={inputBtnClick}
          placeholder={intl.formatMessage({ id: 'MAIN_SEARCH_PLACEHOLDER' })}
          primaryText={intl.formatMessage({ id: 'MAIN_SEARCH' })}
        ></SearchInput>
      </div>
      <div className="index-content-box"></div>
      <div className="index-copyright-box">
        {copyright && (
          <Copyright
            author={copyright.author}
            href={copyright.href}
            startTime={copyright.startTime}
          ></Copyright>
        )}
      </div>
    </div>
  );
}
