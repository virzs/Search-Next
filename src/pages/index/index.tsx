/*
 * @Author: Vir
 * @Date: 2021-03-14 15:22:13
 * @Last Modified by: Vir
 * @Last Modified time: 2021-03-21 19:42:39
 */

import { list } from '@/apis/search';
import { ChangeLocales, SearchInput } from '@/components/global';
import { Button } from '@material-ui/core';
import React from 'react';
import { useIntl } from 'react-intl';
import styles from './index.less';

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
    <div>
      <h1 className={styles.title}>
        Page index
        {intl.formatMessage({ id: 'MAIN_SEARCH' })}
      </h1>
      <ChangeLocales />
      <Button onClick={() => getList()}>获取数据</Button>
      <SearchInput
        placeholder={intl.formatMessage({ id: 'MAIN_SEARCH_PLACEHOLDER' })}
      ></SearchInput>
    </div>
  );
}
