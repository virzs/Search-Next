/*
 * @Author: Vir
 * @Date: 2021-03-14 15:22:13
 * @Last Modified by: Vir
 * @Last Modified time: 2021-03-31 21:47:26
 */

import { copyright as copyrightApi } from '@/apis/common';
import { list } from '@/apis/search';
import Copyright from '@/components/copyright';
import { ChangeLocales, SearchInput } from '@/components/global';
import { UpdateRecordDialog } from '@/components/update-record-dialog';
import { SearchEngineValueTypes } from '@/data/engine';
import { CopyrightType } from '@/data/main';
import { Button, Chip } from '@material-ui/core';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import './index.less';

interface CopyrightTypeWithVersion extends CopyrightType {
  version?: string;
}

export default function IndexPage() {
  const [copyright, setCopyright] = useState({} as CopyrightTypeWithVersion);
  const [engineList, setEngineList] = useState([] as SearchEngineValueTypes[]);
  const [open, setOpen] = useState<boolean>(false);

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

  const { formatMessage } = useIntl();
  return (
    <div className="index">
      <div className="index-navbar-box">
        <ChangeLocales />
      </div>
      <div className="index-logo-box"></div>
      <div className="index-search-box">
        <div className="search-engine-label">
          {engineList.map((i) => (
            <Chip
              key={i.id}
              className="engine-chip"
              size="small"
              label={i.name}
            ></Chip>
          ))}
        </div>
        <SearchInput
          autoFocus
          onChange={inputChange}
          onBtnClick={inputBtnClick}
          placeholder={formatMessage({
            id: 'app.page.index.searchinput.placeholder',
          })}
          primaryText={formatMessage({
            id: 'app.page.index.searchinput.submitbutton',
          })}
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
