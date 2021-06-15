/*
 * @Author: Vir
 * @Date: 2021-03-14 15:22:13
 * @Last Modified by: Vir
 * @Last Modified time: 2021-06-15 15:09:40
 */

import { history } from '@/.umi/core/history';
import { BingImage } from '@/apis/bing/interface';
import { copyright as copyrightApi } from '@/apis/common';
import Copyright from '@/components/copyright';
import DigitalClock from '@/components/digital-clock';
import { ChangeLocales } from '@/components/global';
import { helloMsg } from '@/components/global/hello-msg';
import SearchInput from '@/components/search-input';
import TopSites from '@/components/top-sites';
import { UpdateRecordDialog } from '@/components/update-record-dialog';
import { SearchEngineValueTypes } from '@/data/engine';
import { CopyrightType } from '@/data/main';
import { Button, IconButton } from '@material-ui/core';
import { Settings } from '@material-ui/icons';
import { useSnackbar } from 'notistack';
import React from 'react';
import { useIntl } from 'react-intl';
import './index.less';

interface CopyrightTypeWithVersion extends CopyrightType {
  version?: string;
}

export default function IndexPage() {
  const [copyright, setCopyright] = React.useState(
    {} as CopyrightTypeWithVersion,
  );
  const [open, setOpen] = React.useState<boolean>(false);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [bg, setBg] = React.useState<BingImage>();

  const getCopyright = () => {
    copyrightApi().then((res) => {
      setCopyright(res.data);
    });
  };

  React.useEffect(() => {
    getCopyright();
    helloMsg().then((res) => {
      enqueueSnackbar(res?.content, {
        content: (key) => res.node(key, closeSnackbar),
      });
    });
    // 设置背景
    const image = localStorage.getItem('checkIndexBg');
    if (image) {
      setBg(JSON.parse(image));
      console.log(image);
    }
  }, []);

  const inputChange = (value: string, engine: SearchEngineValueTypes) => {
    console.log('search', value, engine);
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
        <ChangeLocales />
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
          onBtnClick={handleSearch}
          placeholder={formatMessage({
            id: 'app.page.index.searchinput.placeholder',
          })}
          primaryText={formatMessage({
            id: 'app.page.index.searchinput.submitbutton',
          })}
          onPressEnter={handleSearch}
        ></SearchInput>
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
        <Button onClick={() => setOpen(true)}>
          {formatMessage({ id: 'app.component.uploadrecorddialog.title' })}
        </Button>
      </div>
      <UpdateRecordDialog
        open={open}
        onClose={() => setOpen(false)}
      ></UpdateRecordDialog>
    </div>
  );
}
