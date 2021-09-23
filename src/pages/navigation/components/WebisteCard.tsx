/*
 * @Author: Vir
 * @Date: 2021-07-26 13:55:44
 * @Last Modified by: Vir
 * @Last Modified time: 2021-09-23 15:22:52
 */

import BorderColorCard from '@/components/md-custom/card/BorderColorCard';
import {
  Avatar,
  CardActionArea,
  CardHeader,
  IconButton,
  Dialog,
  DialogContent,
  Typography,
  DialogTitle,
  CardActions,
} from '@material-ui/core';
import { MoreHoriz } from '@material-ui/icons';
import React from 'react';
import { Overflow } from 'vmdc-ui';

const WebsiteCard: React.FC<any> = ({ item, ...props }) => {
  const { name, intro, color, url } = item;

  const DialogRef = React.createRef<any>();

  const [visible, setVisible] = React.useState<boolean>(false);

  // 点击更多按钮
  const handleAction = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    setVisible(true);
  };

  return (
    <BorderColorCard color={color}>
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
        />
      </CardActionArea>
      <CardActions>
        <IconButton size="small" onClick={(e) => handleAction(e)}>
          <MoreHoriz />
        </IconButton>
      </CardActions>
      <Dialog
        ref={DialogRef}
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
    </BorderColorCard>
  );
};

export default WebsiteCard;
