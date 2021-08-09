/*
 * @Author: Vir
 * @Date: 2021-03-14 15:22:13
 * @Last Modified by: Vir
 * @Last Modified time: 2021-08-08 18:58:32
 */

import { history } from '@/.umi/core/history';
import { BingImage } from '@/apis/bing/interface';
import { copyright as copyrightApi } from '@/apis/common';
import Copyright from '@/components/copyright';
import DigitalClock from '@/components/digital-clock';
import { helloMsg } from '@/components/global/hello-msg';
import SearchInput from '@/components/search-input';
import TopSites from '@/components/top-sites';
import { SearchEngineValueTypes } from '@/data/engine';
import { CopyrightType } from '@/data/main';
import { IconButton } from '@material-ui/core';
import { Bookmarks, Settings } from '@material-ui/icons';
import { useSnackbar } from 'notistack';
import React from 'react';
import { useIntl } from 'react-intl';
import SugPopper from './components/sug-popper';
import './index.less';

interface CopyrightTypeWithVersion extends CopyrightType {
  version?: string;
}

export default function IndexPage() {
  const [copyright, setCopyright] = React.useState(
    {} as CopyrightTypeWithVersion,
  );
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [bg, setBg] = React.useState<BingImage>();

  const [sugOpen, setSugOpen] = React.useState<boolean>(false);
  const [sugAnchorEl, setSugAnchorEl] = React.useState<null | HTMLElement>(
    null,
  );
  const [wd, setWd] = React.useState<string>('');

  const getCopyright = () => {
    copyrightApi().then((res) => {
      setCopyright(res.data);
    });
  };

  const setBackground = () => {
    // 设置背景
    const image = localStorage.getItem('checkIndexBg');
    if (image) {
      setBg(JSON.parse(image));
      console.log(image);
    }
  };

  // 进入主页消息提示
  const setHello = () => {
    const inFirst = sessionStorage.getItem('inFirst');
    if (!inFirst) {
      helloMsg().then((res) => {
        enqueueSnackbar(res?.content, {
          content: (key) => res.node(key, closeSnackbar),
        });
        sessionStorage.setItem('inFirst', 'true');
      });
    }
  };

  React.useEffect(() => {
    getCopyright();
    setBackground();
    setHello();
  }, []);

  // 搜索框内容变化事件
  const inputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: string,
    engine: SearchEngineValueTypes,
  ) => {
    console.log('search', value, engine);
    setWd(value);
    setSugAnchorEl(e.currentTarget);
    setSugOpen(true);
  };

  const handleSearch = (value: string, engine: SearchEngineValueTypes) => {
    window.open(`${engine.href}${value}`);
  };

  const { formatMessage } = useIntl();
  return (
    <div
      className="index"
      style={{ backgroundImage: bg ? `url('${bg?.url}')` : undefined }}
    >
      <div className="index-navbar-box">
        <IconButton
          onClick={() => {
            history.push('/navigation');
          }}
        >
          <Bookmarks />
        </IconButton>
        <IconButton
          onClick={() => {
            history.push('/setting');
          }}
        >
          <Settings />
        </IconButton>
      </div>
      <div className="index-logo-box">
        <DigitalClock />
      </div>
      <div className="index-search-box">
        <SearchInput
          autoFocus
          onChange={inputChange}
          // onBlur={() => setSugOpen(false)}
          onFocus={() => {
            if (wd) setSugOpen(true);
          }}
          onBtnClick={handleSearch}
          placeholder={formatMessage({
            id: 'app.page.index.searchinput.placeholder',
          })}
          primaryText={formatMessage({
            id: 'app.page.index.searchinput.submitbutton',
          })}
          onPressEnter={handleSearch}
        />
      </div>
      <div className="index-content-box">
        <TopSites></TopSites>
      </div>
      <div className="index-copyright-box">
        {copyright && (
          <Copyright
            author={copyright.author}
            href={copyright.href}
            startTime={copyright.startTime}
          ></Copyright>
        )}
      </div>
      {/* sug popper */}
      <SugPopper open={sugOpen} anchorEl={sugAnchorEl} wd={wd} />
    </div>
  );
}
