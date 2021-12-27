/*
 * @Author: Vir
 * @Date: 2021-08-08 13:15:51
 * @Last Modified by: Vir
 * @Last Modified time: 2021-10-11 17:00:01
 */

import { baiduSug } from '@/apis/baidu';
import useDebounce from '@/hooks/debounce';
import { Popper, Card, List, ListItem } from '@mui/material';
import React from 'react';
import { Empty, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import classNames from 'classnames';

export interface SugPopperProps {
  open: boolean;
  wd: string;
  anchorEl: any;
  code: 'ArrowDown' | 'ArrowUp' | null;
  onSelect: (content: string) => void;
  onKeySelect: (content: string) => void;
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

const SugPopper: React.FC<SugPopperProps> = ({
  open,
  anchorEl,
  wd,
  code,
  onSelect,
  onKeySelect,
  ...props
}) => {
  const [sugList, setSugList] = React.useState<SugList[]>([]);
  const [engine, setEngine] = React.useState<SugEngine>({} as SugEngine);
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);

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
      let data = res.data.data;
      setSugList(data.sugs);
      setEngine(data.engine);
      setSelectedIndex(null);
      setRefresh(false);
    });
  };

  React.useEffect(() => {
    handRefresh();
  }, [wd]);

  React.useEffect(() => {
    const listLength = sugList.length;
    let index = selectedIndex === null ? -1 : selectedIndex;
    if (listLength > 0 && code) {
      if (code === 'ArrowDown') index++;
      if (code === 'ArrowUp') index--;

      if (index >= listLength - 1) index = 0;
      if (index < 0) index = listLength - 1;

      const content = sugList[index]?.content;
      if (content) {
        onKeySelect(content);
        setSelectedIndex(index);
      }
    }
  }, [code]);

  return (
    <Popper
      open={open && wd.length > 0}
      anchorEl={anchorEl}
      transition
      placement="bottom"
      container={anchorEl}
      className="z-10 top-auto left-auto"
    >
      {({ TransitionProps }) => (
        <Card
          {...TransitionProps}
          className="mt-1"
          style={{ width: `${anchorEl?.clientWidth}px` }}
        >
          <Spin spinning={refresh} indicator={<LoadingOutlined spin />}>
            {sugList.length ? (
              <>
                <List disablePadding>
                  {sugList.map((i, j) => (
                    <ListItem
                      button
                      key={j}
                      className={classNames({
                        'bg-gray-100': selectedIndex === j,
                      })}
                      onClick={() => {
                        setSelectedIndex(j);
                        onSelect(i.content);
                      }}
                    >
                      {i.content}
                    </ListItem>
                  ))}
                </List>
                <p className="px-5 py-2 text-right">数据来源：{engine.name}</p>
              </>
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Spin>
        </Card>
      )}
    </Popper>
  );
};

export default SugPopper;
