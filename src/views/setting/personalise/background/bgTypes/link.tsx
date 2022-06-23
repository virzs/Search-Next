/*
 * @Author: Vir
 * @Date: 2021-09-27 13:55:54
 * @Last Modified by: Vir
 * @Last Modified time: 2022-06-20 17:59:49
 */

import {
  Link as LinkData,
  UseBackgroundTypeLinkData,
} from '@/apis/setting/background';
import OutlineCard from '@/components/global/card/outline-card';
import ItemHeader from '@/components/layout/menu-layout/itemHeader';
import { AccordionDetailItem } from '@/pages/setting/components/itemAccordion';
import { isHttpLink } from '@/utils/regexp';
import { css } from '@emotion/css';
import { ImageNotSupported } from '@mui/icons-material';
import { TextField } from '@mui/material';
import { Image } from 'antd';
import classNames from 'classnames';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

export interface LinkProps {
  onChange: (url: string) => void;
  dataSource?: UseBackgroundTypeLinkData;
}

const Link: React.FC<LinkProps> = (props) => {
  const { onChange, dataSource } = props;

  const [url, setUrl] = React.useState<string>('');

  const history = useMemo((): LinkData[] => {
    return dataSource && dataSource?.history ? dataSource.history : [];
  }, [dataSource]);

  useEffect(() => {
    if (dataSource) {
      setUrl(dataSource?.data?.url ?? '');
    }
  }, [dataSource]);

  return (
    <div>
      <div className="m-2">
        <ItemHeader title="在线图片地址" />
        <div className="mt-2">
          <TextField
            multiline
            fullWidth
            size="small"
            label="链接"
            value={url}
            placeholder="请输入图片链接"
            onChange={(e) => {
              setUrl(e.target.value);
            }}
            onBlur={(e) => {
              const check = isHttpLink.test(url);
              if (!check && url.length > 0) {
                toast.error('请输入有效的链接');
              }
              if (check && url.length > 0) {
                onChange(url);
              }
            }}
          />
        </div>
      </div>
      <div className="m-2">
        <ItemHeader title="最近使用的背景" />
        <div
          className={classNames(
            'grid grid-cols-5 gap-2',
            css`
              .ant-image {
                display: block;
              }
            `,
          )}
        >
          {history.map((item, index) => (
            <OutlineCard
              key={index}
              id={item.url}
              value={url}
              onChange={(val) => {
                setUrl(val);
                onChange(val);
              }}
            >
              <div className="rounded overflow-hidden">
                <Image width={151} height={85} src={item.url} preview={false} />
              </div>
            </OutlineCard>
          ))}
          {[...new Array(5 - history.length).keys()].map((i, index) => (
            <div className="rounded overflow-hidden bg-slate-100" key={index}>
              <Image preview={false} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Link;
