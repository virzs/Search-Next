/*
 * @Author: Vir
 * @Date: 2021-09-18 15:41:42
 * @Last Modified by: Vir
 * @Last Modified time: 2022-01-24 14:00:04
 */

import { CardActionArea, CardContent } from '@mui/material';
import { KeyboardArrowRight } from '@mui/icons-material';
import React from 'react';
import classNames from 'classnames';

export interface ItemCardProps {
  icon?: any;
  title?: string | React.ReactNode;
  desc?: string;
  action?: React.ReactNode;
  onClick?: () => void;
  size?: 'small' | 'medium';
}

const ItemCard: React.FC<ItemCardProps> = ({
  title,
  desc,
  icon,
  onClick,
  action,
  size = 'medium',
  ...props
}) => {
  const Content = (
    <CardContent
      className={classNames(
        size === 'medium' && 'px-4 py-3',
        size === 'small' && 'px-3 py-2',
      )}
    >
      <div className="flex">
        <div className="flex-grow flex items-center justify-start">
          {icon && <div className="mr-1">{icon}</div>}
          <div>
            <p className="text-sm mb-0">{title}</p>
            {desc && <p className="text-xs mb-0 text-gray-700">{desc}</p>}
          </div>
        </div>
        <div className="flex items-center">
          {action ? action : <KeyboardArrowRight fontSize="small" />}
        </div>
      </div>
    </CardContent>
  );

  return (
    <div className="bg-white rounded border hover:bg-gray-100 transition">
      {action ? (
        Content
      ) : (
        <CardActionArea onClick={() => (onClick ? onClick() : null)}>
          {Content}
        </CardActionArea>
      )}
    </div>
  );
};

export default ItemCard;
