/*
 * @Author: Vir
 * @Date: 2021-03-14 15:22:13
 * @Last Modified by: Vir
 * @Last Modified time: 2021-03-24 22:04:57
 */

import { list } from '@/apis/search';
import { ChangeLocales, SearchInput } from '@/components/global';
import { Button } from '@material-ui/core';
import React from 'react';
import { useIntl } from 'react-intl';
import './index.less';

export default function IndexPage() {
  const getList = () => {
    list().then((res) => {
      console.log(res.data);
    });
  };

  React.useEffect(() => {
    getList();
  });

  const intl = useIntl();
  return (
    <div className="index">
      <ChangeLocales />
      <Button onClick={() => getList()}>获取数据</Button>
      <SearchInput
        autoFocus
        placeholder={intl.formatMessage({ id: 'MAIN_SEARCH_PLACEHOLDER' })}
      ></SearchInput>
    </div>
  );
}
