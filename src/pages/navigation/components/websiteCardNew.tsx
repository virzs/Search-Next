/*
 * @Author: Vir
 * @Date: 2021-11-27 23:01:18
 * @Last Modified by: Vir
 * @Last Modified time: 2021-12-28 17:23:20
 */
import { addSite } from '@/apis/site';
import { Website } from '@/data/navigation/interface';
import { hexToRgba } from '@/utils/color';
import { css } from '@emotion/css';
import {
  Avatar,
  Button,
  ButtonGroup,
  CardActionArea,
  Tooltip,
} from '@mui/material';
import { Add, CopyAll, MoreHoriz } from '@mui/icons-material';
import { message } from 'antd';
import classNames from 'classnames';
import React from 'react';
import { Overflow } from 'vmdc-ui';
import { getWebIconByUrl } from '@/apis/common';

export interface WebsiteCardNewProps {
  datasource: Website;
}

const WebsiteCardNew: React.FC<WebsiteCardNewProps> = (props) => {
  const { datasource } = props;
  const { name, intro, color, url } = datasource;

  const onAdd = () => {
    const res = addSite({
      name,
      url: url.substring(0, url.lastIndexOf('/')),
    });
    if (res) message.success('添加成功');
  };

  const onCopy = () => {
    navigator.clipboard.writeText(url);
    message.success(`已复制 ${name} (${url})`);
  };

  const onMore = () => {
    message.warning('功能开发中...');
  };

  return (
    <div
      className={classNames(
        'cursor-pointer shadow-md rounded border-b-2',
        css`
          --tw-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1),
            0 1px 3px 0 ${hexToRgba(color ?? '#000', 0.45).rgba} !important;
          border-bottom-color: ${color};
        `,
      )}
    >
      <CardActionArea>
        <Tooltip title={intro || '暂无介绍'}>
          <div className="p-3 flex gap-3" onClick={() => window.open(url)}>
            <Avatar
              // style={{ backgroundColor: color }}
              src={getWebIconByUrl(url)}
            >
              {name.split('')[0].toUpperCase()}
            </Avatar>
            <div className="flex-grow overflow-hidden">
              <p className="font-bold text-base whitespace-nowrap overflow-x-hidden">
                {name}
              </p>
              <Overflow>{(intro as any) || ('暂无介绍' as any)}</Overflow>
            </div>
          </div>
        </Tooltip>
      </CardActionArea>
      <div>
        <ButtonGroup
          disableElevation
          variant="text"
          size="small"
          className={classNames(
            'w-full h-full flex',
            css`
              justify-content: flex-end;
              button {
                height: 100%;
                border-right: 0px !important;
              }
            `,
          )}
        >
          <Tooltip title="添加到首页">
            <Button onClick={onAdd}>
              <Add />
            </Button>
          </Tooltip>
          <Tooltip title="复制网站链接">
            <Button onClick={onCopy}>
              <CopyAll />
            </Button>
          </Tooltip>
          <Tooltip title="更多">
            <Button onClick={onMore}>
              <MoreHoriz />
            </Button>
          </Tooltip>
        </ButtonGroup>
      </div>
    </div>
  );
};

export default WebsiteCardNew;
