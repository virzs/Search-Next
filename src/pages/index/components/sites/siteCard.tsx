/*
 * @Author: Vir
 * @Date: 2021-04-11 14:54:17
 * @Last Modified by: Vir
 * @Last Modified time: 2021-10-10 16:00:59
 */

import { getWebIconByUrl } from '@/apis/common';
import { Site } from '@/apis/site';
import Menu from '@/components/md-custom/menu';
import { css } from '@emotion/css';
import { Avatar, MenuItem, IconButton } from '@mui/material';
import {
  AddOutlined,
  DeleteOutlineOutlined,
  EditOutlined,
  MoreHorizOutlined,
} from '@mui/icons-material';
import classNames from 'classnames';
import React from 'react';

type SiteCardType = 'view' | 'add';

interface SiteCardPropTypes {
  type?: SiteCardType;
  item?: Site;
  onClick?: () => void;
  onAdd?: () => void;
  onEdit?: (value: Site) => void;
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
    setAnchorEl(null);
    if (onEdit && item) onEdit(item);
  };

  const handleRemove = () => {
    setAnchorEl(null);
    if (onRemove && item) onRemove(item._id);
  };

  return (
    <>
      <div
        className={classNames(
          'cursor-pointer bg-transparent rounded shadow-none relative w-28 h-20 transition-all hover:bg-rgba-gray-3',
          css`
            &:hover {
              .handle-container {
                opacity: 1 !important;
              }
            }
          `,
        )}
        onClick={onClick}
      >
        <div
          className={classNames([
            'content-container transition-all box-border flex flex-col items-center w-full h-full px-3 py-2 rounded',
            type === 'add' ? 'justify-start text-primary' : 'justify-end',
          ])}
        >
          <Avatar
            className={classNames(
              'bg-white rounded mx-auto',
              {
                'text-primary': type === 'add',
              },
              css`
                img {
                  max-width: 24px;
                  height: 24px;
                }
              `,
            )}
            variant="rounded"
            src={item?.iconUrl ? item?.iconUrl : getWebIconByUrl(item?.url)}
            onClick={onAdd ? onAdd : undefined}
          >
            {type === 'add' && <AddOutlined />}
          </Avatar>
          <p className="text-center flex justify-center mt-1 w-full text-var-main-10">
            <a className="overflow-hidden text-ellipsis">{item?.name}</a>
          </p>
        </div>
        {type === 'view' && (
          <span className="handle-container w-6 h-6 flex justify-center absolute top-1 right-1 z-10 opacity-0 transition-all">
            <IconButton
              className="rounded"
              size="small"
              aria-controls={`site-${item?.name}-menu`}
              aria-haspopup="true"
              onClick={onMenuOpen}
            >
              <MoreHorizOutlined className="text-var-main-10" />
            </IconButton>
          </span>
        )}
      </div>
      <Menu
        id={`site-${item?.name}-menu`}
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={onMenuClose}
        config={[
          {
            label: '修改',
            onClick: handleEdit,
            icon: EditOutlined,
          },
          {
            label: '删除',
            onClick: handleRemove,
            icon: DeleteOutlineOutlined,
          },
        ]}
      />
    </>
  );
};

export default SiteCard;
