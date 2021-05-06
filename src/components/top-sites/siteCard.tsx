/*
 * @Author: Vir
 * @Date: 2021-04-11 14:54:17
 * @Last Modified by: Vir
 * @Last Modified time: 2021-05-04 22:50:12
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
import classNames from 'classnames';
import React from 'react';
import './styles/siteCard.less';

type SiteCardType = 'view' | 'add';

interface SiteCardPropTypes {
  type?: SiteCardType;
  item?: SiteListType;
  onClick?: () => void;
  onAdd?: () => void;
  onEdit?: (value: SiteListType) => void;
  onRemove?: (id: string) => void;
}

const SiteCard: React.FC<SiteCardPropTypes> = ({
  type = 'view',
  item,
  onClick,
  onAdd,
  onEdit,
  onRemove,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

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
      <div className="VuiSiteCard-root" onClick={onClick}>
        <div
          className={classNames(['content-container', { add: type === 'add' }])}
        >
          <Avatar
            className="image-container"
            variant="rounded"
            src={getWebIconByUrl(item?.url)}
            onClick={onAdd ? onAdd : undefined}
          >
            {type === 'add' && <Add />}
          </Avatar>
          <p className="title-container">
            <a>{item?.name}</a>
          </p>
        </div>
        {type === 'view' && (
          <span className="handle-container">
            <IconButton
              size="small"
              aria-controls={`site-${item?.name}-menu`}
              aria-haspopup="true"
              onClick={onMenuOpen}
            >
              <MoreHoriz />
            </IconButton>
          </span>
        )}
      </div>
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
