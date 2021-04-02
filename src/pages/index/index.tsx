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
import classnames from 'classnames';
import './index.less';

interface CopyrightTypeWithVersion extends CopyrightType {
  version?: string;
}

export default function IndexPage() {
  const [copyright, setCopyright] = useState({} as CopyrightTypeWithVersion);
  const [engineList, setEngineList] = useState([] as SearchEngineValueTypes[]);
  const [engine, setEngine] = useState({} as SearchEngineValueTypes);
  const [open, setOpen] = useState<boolean>(false);

  const getList = () => {
    list().then((res) => {
      setEngineList(res.data);
      if (res.data.length === 0) return;
      const engineId = localStorage.getItem('engine_id');
      if (engineId) {
        const engine = res.data.find((i) => i.id === engineId);
        setEngine(engine ? engine : res.data[0]);
      } else {
        setEngine(res.data[0]);
      }
    });
  };

  const getCopyright = () => {
    copyrightApi().then((res) => {
      setCopyright(res.data);
    });
  };

  const changeEngine = (item: SearchEngineValueTypes) => {
    localStorage.setItem('engine_id', item.id);
    setEngine(item);
  };

  useEffect(() => {
    getList();
    getCopyright();
  }, []);

  const inputChange = (value: string) => {
    console.log('search', value);
  };

  const handleSearch = (value: string) => {
    window.open(`${engine.href}${value}`);
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
              className={classnames('engine-chip', {
                selected: i.id === engine.id,
              })}
              size="small"
              label={i.name}
              onClick={() => changeEngine(i)}
            ></Chip>
          ))}
        </div>
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
