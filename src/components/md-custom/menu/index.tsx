/*
 * @Author: Vir
 * @Date: 2021-10-06 18:00:08
 * @Last Modified by: Vir
 * @Last Modified time: 2021-10-06 23:08:31
 */

import React from 'react';
import {
  alpha,
  Menu as MMenu,
  MenuItem as MMenuItem,
  MenuItemProps,
  MenuProps as MMenuProps,
  styled,
  SvgIconTypeMap,
} from '@material-ui/core';
import { OverridableComponent } from '@material-ui/core/OverridableComponent';

export interface Item {
  label: string;
  icon?: OverridableComponent<SvgIconTypeMap<{}, 'svg'>>;
  disabled?: boolean;
  selected?: boolean;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
}

export interface MenuProps extends MMenuProps {
  config: Item[];
}

const StyledMenu = styled((props: MMenuProps) => (
  <MMenu
    elevation={0}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiPaper-root': {
    backgroundColor: 'rgba(253, 253, 253, 0.8)',
    backdropFilter: 'blur(8px)',
    borderRadius: 4,
    marginTop: theme.spacing(1),
    minWidth: 140,
    color:
      theme.palette.mode === 'light'
        ? 'rgb(55, 65, 81)'
        : theme.palette.grey[300],
    boxShadow:
      'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
    '& .MuiMenu-list': {
      padding: '4px',
    },
  },
}));

const StyledMenuItem = styled((props: MenuItemProps) => (
  <MMenuItem {...props} />
))(({ theme }) => ({
  borderRadius: 4,
  padding: '4px 8px',
  fontSize: 14,
  '& .MuiSvgIcon-root': {
    fontSize: 14,
    color: theme.palette.text.secondary,
    marginRight: theme.spacing(1.5),
  },
  '&:active': {
    backgroundColor: alpha(
      theme.palette.primary.main,
      theme.palette.action.selectedOpacity,
    ),
  },
}));

export const MenuItem = StyledMenuItem;

const Menu: React.FC<MenuProps> = ({ config, ...props }) => {
  return (
    <StyledMenu
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      {...props}
    >
      {config.map((i, j: number) => (
        <StyledMenuItem key={j} onClick={i.onClick}>
          {i.icon && React.createElement(i.icon)}
          {i.label}
        </StyledMenuItem>
      ))}
    </StyledMenu>
  );
};

export default Menu;
