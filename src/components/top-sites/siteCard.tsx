/*
 * @Author: Vir
 * @Date: 2021-04-11 14:54:17
 * @Last Modified by: Vir
 * @Last Modified time: 2021-04-27 23:27:39
 */

import { getWebIconByUrl } from '@/apis/common';
import { SiteListType } from '@/models/site';
import {
  Card,
  CardContent,
  Avatar,
  CardHeader,
  Menu,
  MenuItem,
  IconButton,
} from '@material-ui/core';
import { Add, Delete, Edit, MoreHoriz } from '@material-ui/icons';
import React from 'react';
import './styles/siteCard.less';

type SiteCardType = 'view' | 'add';

interface SiteCardPropTypes {
  type?: SiteCardType;
  item?: SiteListType;
  onClick?: () => void;
  onEdit?: (value: SiteListType) => void;
  onRemove?: (id: string) => void;
}

const SiteCard: React.FC<SiteCardPropTypes> = ({
  type = 'view',
  item,
  onClick,
  onEdit,
  onRemove,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const viewContent = () => {
    return (
      <>
        <Avatar
          className="icon"
          variant="rounded"
          src={getWebIconByUrl(item?.url)}
        ></Avatar>
        <p className="site-name">{item?.name}</p>
      </>
    );
  };

  const addContent = () => {
    return (
      <Avatar className="icon" variant="rounded">
        <Add />
      </Avatar>
    );
  };

  const onMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const onMenuClose = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setAnchorEl(null);
  };

  const siteClick = () => {
    if (onClick) onClick();
  };

  const handleEdit = () => {
    if (onEdit && item) onEdit(item);
  };

  const handleRemove = () => {
    if (onRemove && item) onRemove(item.id);
  };

  return (
    <>
      <Card className="top-site-item" onClick={siteClick}>
        <CardHeader
          title={
            <IconButton
              size="small"
              aria-controls={`site-${item?.name}-menu`}
              aria-haspopup="true"
              onClick={onMenuOpen}
            >
              <MoreHoriz />
            </IconButton>
          }
        />
        <CardContent className="site-item-content">
          {type === 'add' && addContent()}
          {type === 'view' && viewContent()}
        </CardContent>
      </Card>
      <Menu
        id={`site-${item?.name}-menu`}
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={onMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <Edit /> 修改
        </MenuItem>
        <MenuItem onClick={handleRemove}>
          <Delete />
          删除
        </MenuItem>
      </Menu>
    </>
  );
};

export default SiteCard;
