/*
 * @Author: Vir
 * @Date: 2021-07-26 13:55:44
 * @Last Modified by: Vir
 * @Last Modified time: 2021-07-26 17:23:00
 */

import { getWebIconByUrl } from '@/apis/common';
import { replaceUrlHaveHttpsOrHttpToEmpty } from '@/utils/common';
import { css } from '@emotion/css';
import {
  Avatar,
  Button,
  Card,
  CardActionArea,
  CardHeader,
  IconButton,
  CardActions,
  Tooltip,
  Dialog,
  DialogContent,
  Typography,
  DialogTitle,
} from '@material-ui/core';
import { MoreHoriz } from '@material-ui/icons';
import classNames from 'classnames';
import React from 'react';
import { Overflow } from 'vmdc-ui';

const WebsiteCardStyle = () => {
  return css`
    cursor: pointer;
    .MuiCardHeader-root {
      height: 100%;
      align-items: flex-start;
      .MuiCardHeader-content {
        width: calc(100% - 80px);
      }
      .MuiCardHeader-subheader {
        p {
          margin-bottom: 0;
        }
      }
    }
    .MuiCardActions-root {
      justify-content: flex-end;
    }
  `;
};

const WebsiteCard: React.FC<any> = ({ item, ...props }) => {
  const { name, intro, color, url } = item;

  const [visible, setVisible] = React.useState<boolean>(false);

  // 点击更多按钮
  const handleAction = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    setVisible(true);
  };

  return (
    <Card className={classNames(WebsiteCardStyle())}>
      <CardActionArea
        onClick={() => {
          window.open(url);
        }}
      >
        <CardHeader
          avatar={
            <Avatar
              style={{ backgroundColor: color }}
              aria-label={name}
              src={url}
            >
              {name.split('')[0].toUpperCase()}
            </Avatar>
          }
          title={name}
          subheader={<Overflow>{intro || '暂无介绍'}</Overflow>}
          action={
            <IconButton size="small" onClick={(e) => handleAction(e)}>
              <MoreHoriz />
            </IconButton>
          }
        />
      </CardActionArea>
      <Dialog
        open={visible}
        fullWidth
        maxWidth="xs"
        onClose={() => setVisible(false)}
      >
        <DialogTitle>{name}</DialogTitle>
        <DialogContent>
          <Typography>{intro || '暂无介绍'}</Typography>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default WebsiteCard;
