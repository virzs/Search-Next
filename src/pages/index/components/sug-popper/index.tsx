/*
 * @Author: Vir
 * @Date: 2021-08-08 13:15:51
 * @Last Modified by: Vir
 * @Last Modified time: 2021-08-08 18:59:45
 */

import { baiduSug } from '@/apis/baidu';
import useDebounce from '@/hooks/debounce';
import { css } from '@emotion/css';
import { Card, List, ListItem, Popper } from '@material-ui/core';
import { Empty } from 'antd';
import classNames from 'classnames';
import React from 'react';
import { Spin } from 'vmdc-ui';

export interface SugPopperProps {
  open: boolean;
  wd: string;
  anchorEl: any;
}

interface SugList {
  sa: string;
  type: string;
  content: string;
}

interface SugEngine {
  name: string;
  value: string;
}

const SugPopperCardCss = (width: number = 0) => css`
  width: ${width}px;
  margin-top: 4px;
`;

const SugPopper: React.FC<SugPopperProps> = ({
  open,
  anchorEl,
  wd,
  ...props
}) => {
  const [sugList, setSugList] = React.useState<SugList[]>([]);
  const [engine, setEngine] = React.useState<SugEngine>({} as SugEngine);

  const [refresh, setRefresh] = React.useState<boolean>(false);

  const handRefresh = useDebounce(function () {
    getSug();
  }, 300);

  const getSug = () => {
    if (!wd) {
      setSugList([]);
      return;
    }
    setRefresh(true);
    baiduSug(wd).then((res) => {
      console.log(res.data.data);
      let data = res.data.data;
      setSugList(data.sugs);
      setEngine(data.engine);
      setRefresh(false);
    });
  };

  React.useEffect(() => {
    handRefresh();
    console.log(wd);
  }, [wd]);

  return (
    <Popper open={open} anchorEl={anchorEl} transition>
      <Card className={classNames(SugPopperCardCss(anchorEl?.clientWidth))}>
        <Spin spinning={refresh} color="#5f5f5f" type="chase">
          {sugList.length ? (
            <>
              <List>
                {sugList.map((i, j) => (
                  <ListItem button key={j}>
                    {i.content}
                  </ListItem>
                ))}
              </List>
              <p>数据来源：{engine.name}</p>
            </>
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </Spin>
      </Card>
    </Popper>
  );
};

export default SugPopper;
